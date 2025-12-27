using AllureModa.API.Data;
using AllureModa.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace AllureModa.API.Services
{
    public interface IPageConfigService
    {
        Task<PageConfig?> GetPublishedConfigAsync(string pageSlug);
        Task<PageConfig?> GetDraftConfigAsync(string pageSlug);
        Task<PageConfig> SaveDraftAsync(string pageSlug, List<PageBlockDto> blocks);
        Task<PageConfig> PublishAsync(string pageSlug);
    }

    public class PageBlockDto
    {
        public string? Id { get; set; }
        public BlockType Type { get; set; }
        public int Order { get; set; }
        public JsonElement Config { get; set; }
    }

    public class PageConfigService : IPageConfigService
    {
        private readonly ApplicationDbContext _context;

        public PageConfigService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<PageConfig?> GetPublishedConfigAsync(string pageSlug)
        {
            return await _context.PageConfigs
                .Include(p => p.Blocks.OrderBy(b => b.Order))
                .FirstOrDefaultAsync(p => p.PageSlug == pageSlug && !p.IsDraft);
        }

        public async Task<PageConfig?> GetDraftConfigAsync(string pageSlug)
        {
            // First, try to get the draft
            var draft = await _context.PageConfigs
                .Include(p => p.Blocks.OrderBy(b => b.Order))
                .FirstOrDefaultAsync(p => p.PageSlug == pageSlug && p.IsDraft);

            if (draft != null)
            {
                return draft;
            }

            // If no draft exists, return the published version as a "virtual" draft
            // so the admin can see the current live state and edit from there
            var published = await _context.PageConfigs
                .Include(p => p.Blocks.OrderBy(b => b.Order))
                .FirstOrDefaultAsync(p => p.PageSlug == pageSlug && !p.IsDraft);

            if (published != null)
            {
                // Return a copy marked as draft (but not saved yet)
                return new PageConfig
                {
                    Id = null, // Indicates it's not saved
                    PageSlug = pageSlug,
                    IsDraft = true,
                    Blocks = published.Blocks.Select(b => new PageBlock
                    {
                        Id = b.Id,
                        Type = b.Type,
                        Order = b.Order,
                        ConfigJson = b.ConfigJson
                    }).ToList(),
                    UpdatedAt = published.UpdatedAt
                };
            }

            return null;
        }

        public async Task<PageConfig> SaveDraftAsync(string pageSlug, List<PageBlockDto> blocks)
        {
            var draft = await _context.PageConfigs
                .Include(p => p.Blocks)
                .FirstOrDefaultAsync(p => p.PageSlug == pageSlug && p.IsDraft);

            if (draft == null)
            {
                draft = new PageConfig
                {
                    PageSlug = pageSlug,
                    IsDraft = true
                };
                _context.PageConfigs.Add(draft);
            }

            // Clear existing blocks
            _context.PageBlocks.RemoveRange(draft.Blocks);

            // Add new blocks
            draft.Blocks = blocks.Select((b, index) => new PageBlock
            {
                Id = b.Id ?? Guid.NewGuid().ToString(),
                PageConfigId = draft.Id,
                Type = b.Type,
                Order = b.Order >= 0 ? b.Order : index,
                ConfigJson = b.Config.GetRawText()
            }).ToList();

            draft.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return draft;
        }

        public async Task<PageConfig> PublishAsync(string pageSlug)
        {
            var draft = await _context.PageConfigs
                .Include(p => p.Blocks)
                .FirstOrDefaultAsync(p => p.PageSlug == pageSlug && p.IsDraft);

            if (draft == null)
            {
                throw new InvalidOperationException("No draft found to publish");
            }

            // Find or create published version
            var published = await _context.PageConfigs
                .Include(p => p.Blocks)
                .FirstOrDefaultAsync(p => p.PageSlug == pageSlug && !p.IsDraft);

            if (published == null)
            {
                published = new PageConfig
                {
                    PageSlug = pageSlug,
                    IsDraft = false
                };
                _context.PageConfigs.Add(published);
            }
            else
            {
                // Clear existing published blocks
                _context.PageBlocks.RemoveRange(published.Blocks);
            }

            // Copy blocks from draft to published
            published.Blocks = draft.Blocks.Select(b => new PageBlock
            {
                PageConfigId = published.Id,
                Type = b.Type,
                Order = b.Order,
                ConfigJson = b.ConfigJson
            }).ToList();

            published.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return published;
        }
    }
}
