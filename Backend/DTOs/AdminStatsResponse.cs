namespace AllureModa.API.DTOs.Admin
{
    public class AdminStatsResponse
    {
        public int Users { get; set; }
        public int Products { get; set; }
        public int Orders { get; set; }
        public decimal Revenue { get; set; }
        public List<Models.Product> TopProducts { get; set; } = new();
        public DashboardCharts Charts { get; set; } = new();
    }

    public class DashboardCharts
    {
        public Dictionary<string, int> Users { get; set; } = new();
        public Dictionary<string, int> Orders { get; set; } = new();
        public Dictionary<string, decimal> Revenue { get; set; } = new();
    }
}
