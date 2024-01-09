using API.DTOs;
using API.Entities;
using API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class PhotoRepository : IPhotoRepository
{
    private readonly DatingDbContext _datingDbContext;

    public PhotoRepository(DatingDbContext datingDbContext)
    {
        _datingDbContext = datingDbContext;
    }

    public async Task<Photo> GetPhotoById(int id)
    {
        return await _datingDbContext
            .Photos
            .IgnoreQueryFilters()
            .SingleOrDefaultAsync(x => x.Id == id);
    }

    public async Task<IEnumerable<PhotoForApprovalDto>> GetUnapprovedPhotos()
    {
        return await _datingDbContext
            .Photos
            .IgnoreQueryFilters()
            .Where(p => p.IsApproved == false)
            .Select(
                u =>
                    new PhotoForApprovalDto
                    {
                        Id = u.Id,
                        Username = u.AppUser.UserName,
                        Url = u.Url,
                        IsApproved = u.IsApproved
                    }
            )
            .ToListAsync();
    }

    public void RemovePhoto(Photo photo)
    {
        _datingDbContext.Photos.Remove(photo);
    }
}
