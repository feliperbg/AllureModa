using AllureModa.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AllureModa.API.Controllers
{
    [ApiController]
    [Route("api/images")]
    [Authorize(Roles = "ADMIN")]
    public class ImageController : ControllerBase
    {
        private readonly StorageService _storageService;

        public ImageController(StorageService storageService)
        {
            _storageService = storageService;
        }

        /// <summary>
        /// Upload an image with automatic processing (resize + WebP conversion)
        /// Returns URLs for all generated sizes
        /// </summary>
        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile file, [FromQuery] string folder = "products")
        {
            try
            {
                var result = await _storageService.UploadImageAsync(file, folder);
                return Ok(new
                {
                    id = result.Id,
                    url = result.Url,               // Primary (medium)
                    thumbnailUrl = result.ThumbnailUrl,
                    mediumUrl = result.MediumUrl,
                    largeUrl = result.LargeUrl,
                    message = "Image uploaded and processed successfully"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to upload image", error = ex.Message });
            }
        }

        /// <summary>
        /// Delete all versions of an image by its ID
        /// </summary>
        [HttpDelete("{imageId}")]
        public async Task<IActionResult> DeleteImage(string imageId, [FromQuery] string folder = "products")
        {
            if (string.IsNullOrEmpty(imageId))
                return BadRequest(new { message = "Image ID is required" });

            try
            {
                await _storageService.DeleteImageAsync(imageId, folder);
                return Ok(new { message = "Image deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete image", error = ex.Message });
            }
        }
    }
}
