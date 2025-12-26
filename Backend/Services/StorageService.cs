using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace AllureModa.API.Services
{
    public class StorageService
    {
        private readonly Supabase.Client _supabaseClient;
        private readonly string _bucketName;
        private readonly ILogger<StorageService> _logger;

        // Standard image sizes for e-commerce
        private static readonly Dictionary<string, int> ImageSizes = new()
        {
            { "thumb", 200 },   // Thumbnails for listings/cart
            { "medium", 600 },  // Product cards
            { "large", 1200 }   // Product detail page
        };

        public StorageService(IConfiguration configuration, ILogger<StorageService> logger)
        {
            _logger = logger;
            
            var url = configuration["Supabase:Url"] 
                ?? throw new InvalidOperationException("Supabase:Url not configured");
            var key = configuration["Supabase:Key"] 
                ?? throw new InvalidOperationException("Supabase:Key not configured");
            _bucketName = configuration["Supabase:BucketName"] 
                ?? throw new InvalidOperationException("Supabase:BucketName not configured");

            var options = new Supabase.SupabaseOptions
            {
                AutoRefreshToken = false,
                AutoConnectRealtime = false
            };

            _supabaseClient = new Supabase.Client(url, key, options);
        }

        /// <summary>
        /// Upload an image with automatic processing: resize to multiple sizes and convert to WebP
        /// </summary>
        public async Task<ImageUploadResult> UploadImageAsync(IFormFile file, string folder = "products")
        {
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is required");

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp", "image/gif" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                throw new ArgumentException($"Invalid file type: {file.ContentType}. Allowed: {string.Join(", ", allowedTypes)}");

            var baseId = Guid.NewGuid().ToString();
            var result = new ImageUploadResult { Id = baseId };

            try
            {
                using var originalStream = file.OpenReadStream();
                using var image = await Image.LoadAsync(originalStream);

                // Process and upload each size
                foreach (var size in ImageSizes)
                {
                    var processedBytes = await ProcessImageAsync(image, size.Value);
                    var filePath = $"{folder}/{baseId}_{size.Key}.webp";

                    await _supabaseClient.Storage
                        .From(_bucketName)
                        .Upload(processedBytes, filePath, new Supabase.Storage.FileOptions
                        {
                            ContentType = "image/webp",
                            Upsert = false
                        });

                    var publicUrl = _supabaseClient.Storage
                        .From(_bucketName)
                        .GetPublicUrl(filePath);

                    // Store URLs in result
                    switch (size.Key)
                    {
                        case "thumb": result.ThumbnailUrl = publicUrl; break;
                        case "medium": result.MediumUrl = publicUrl; break;
                        case "large": result.LargeUrl = publicUrl; break;
                    }
                }

                // Set primary URL to medium size (best for general use)
                result.Url = result.MediumUrl;

                _logger.LogInformation("Image uploaded with {Count} sizes: {Id}", ImageSizes.Count, baseId);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload image: {FileName}", file.FileName);
                throw;
            }
        }

        /// <summary>
        /// Process image: resize maintaining aspect ratio and convert to WebP
        /// </summary>
        private async Task<byte[]> ProcessImageAsync(Image image, int maxSize)
        {
            // Clone to avoid modifying original
            using var clone = image.Clone(ctx =>
            {
                // Resize maintaining aspect ratio (fit within square)
                var resizeOptions = new ResizeOptions
                {
                    Size = new Size(maxSize, maxSize),
                    Mode = ResizeMode.Max // Maintains aspect ratio
                };
                ctx.Resize(resizeOptions);
            });

            using var memoryStream = new MemoryStream();
            
            // Save as WebP with good quality (75 is a good balance)
            var encoder = new WebpEncoder
            {
                Quality = 75,
                FileFormat = WebpFileFormatType.Lossy
            };
            
            await clone.SaveAsync(memoryStream, encoder);
            return memoryStream.ToArray();
        }

        /// <summary>
        /// Delete all versions of an image
        /// </summary>
        public async Task DeleteImageAsync(string imageId, string folder = "products")
        {
            try
            {
                var filesToDelete = ImageSizes.Keys
                    .Select(size => $"{folder}/{imageId}_{size}.webp")
                    .ToList();

                await _supabaseClient.Storage
                    .From(_bucketName)
                    .Remove(filesToDelete);

                _logger.LogInformation("Deleted {Count} image versions: {Id}", filesToDelete.Count, imageId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete image: {Id}", imageId);
                throw;
            }
        }
    }

    /// <summary>
    /// Result of image upload containing all generated URLs
    /// </summary>
    public class ImageUploadResult
    {
        public string Id { get; set; } = "";
        public string Url { get; set; } = "";           // Primary URL (medium)
        public string ThumbnailUrl { get; set; } = "";  // 200px
        public string MediumUrl { get; set; } = "";     // 600px
        public string LargeUrl { get; set; } = "";      // 1200px
    }
}
