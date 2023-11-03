using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class DatingDbContext : DbContext
{
    public DatingDbContext(DbContextOptions options) : base(options)
    {
    }

    public DbSet<AppUser> Users { get; set; }
}
