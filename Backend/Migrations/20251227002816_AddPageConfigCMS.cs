using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AllureModa.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPageConfigCMS : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PageConfigs",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    PageSlug = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsDraft = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PageConfigs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PageBlocks",
                columns: table => new
                {
                    Id = table.Column<string>(type: "text", nullable: false),
                    PageConfigId = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Order = table.Column<int>(type: "integer", nullable: false),
                    ConfigJson = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PageBlocks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PageBlocks_PageConfigs_PageConfigId",
                        column: x => x.PageConfigId,
                        principalTable: "PageConfigs",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PageBlocks_PageConfigId",
                table: "PageBlocks",
                column: "PageConfigId");

            migrationBuilder.CreateIndex(
                name: "IX_PageConfigs_PageSlug_IsDraft",
                table: "PageConfigs",
                columns: new[] { "PageSlug", "IsDraft" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PageBlocks");

            migrationBuilder.DropTable(
                name: "PageConfigs");
        }
    }
}
