using AllureModa.API.Models;
using AllureModa.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api")]
    public class PageConfigController : ControllerBase
    {
        private readonly IPageConfigService _pageConfigService;

        public PageConfigController(IPageConfigService pageConfigService)
        {
            _pageConfigService = pageConfigService;
        }

        /// <summary>
        /// Get published page configuration (public endpoint)
        /// </summary>
        [HttpGet("page-config/{slug}")]
        public async Task<ActionResult<PageConfigResponse>> GetPublished(string slug)
        {
            var config = await _pageConfigService.GetPublishedConfigAsync(slug);
            
            if (config == null)
            {
                return NotFound(new { message = $"Page '{slug}' not found" });
            }

            return Ok(MapToResponse(config));
        }

        /// <summary>
        /// Get draft page configuration (admin only)
        /// </summary>
        [HttpGet("admin/page-config/{slug}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<PageConfigResponse>> GetDraft(string slug)
        {
            var config = await _pageConfigService.GetDraftConfigAsync(slug);
            
            if (config == null)
            {
                // Return empty draft if none exists
                return Ok(new PageConfigResponse
                {
                    Id = null,
                    PageSlug = slug,
                    IsDraft = true,
                    Blocks = new List<PageBlockResponse>(),
                    UpdatedAt = null
                });
            }

            return Ok(MapToResponse(config));
        }

        /// <summary>
        /// Save draft page configuration (admin only)
        /// </summary>
        [HttpPut("admin/page-config/{slug}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<PageConfigResponse>> SaveDraft(string slug, [FromBody] SavePageConfigRequest request)
        {
            try
            {
                var config = await _pageConfigService.SaveDraftAsync(slug, request.Blocks);
                return Ok(MapToResponse(config));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Publish draft to live (admin only)
        /// </summary>
        [HttpPost("admin/page-config/{slug}/publish")]
        [Authorize(Roles = "ADMIN")]
        public async Task<ActionResult<PageConfigResponse>> Publish(string slug)
        {
            try
            {
                var config = await _pageConfigService.PublishAsync(slug);
                return Ok(MapToResponse(config));
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private static PageConfigResponse MapToResponse(PageConfig config)
        {
            return new PageConfigResponse
            {
                Id = config.Id,
                PageSlug = config.PageSlug,
                IsDraft = config.IsDraft,
                UpdatedAt = config.UpdatedAt,
                Blocks = config.Blocks.OrderBy(b => b.Order).Select(b => new PageBlockResponse
                {
                    Id = b.Id,
                    Type = b.Type.ToString(),
                    Order = b.Order,
                    Config = JsonSerializer.Deserialize<JsonElement>(b.ConfigJson)
                }).ToList()
            };
        }
    }

    public class SavePageConfigRequest
    {
        public List<PageBlockDto> Blocks { get; set; } = new();
    }

    public class PageConfigResponse
    {
        public string? Id { get; set; }
        public string PageSlug { get; set; } = null!;
        public bool IsDraft { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<PageBlockResponse> Blocks { get; set; } = new();
    }

    public class PageBlockResponse
    {
        public string Id { get; set; } = null!;
        public string Type { get; set; } = null!;
        public int Order { get; set; }
        public JsonElement Config { get; set; }
    }
}
