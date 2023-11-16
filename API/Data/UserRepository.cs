using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class UserRepository : IUserRepository
{
    private readonly DatingDbContext _datingDbContext;
    private readonly IMapper _mapper;

    public UserRepository(DatingDbContext datingDbContext, IMapper mapper)
    {
        _mapper = mapper;
        _datingDbContext = datingDbContext;
    }

    public async Task<MemberDto> GetMemberAsync(string username)
    {
        return await _datingDbContext
            .Users
            .Where(x => x.UserName == username)
            .ProjectTo<MemberDto>(_mapper.ConfigurationProvider)
            .SingleOrDefaultAsync();
    }

    public async Task<IEnumerable<MemberDto>> GetMembersAsync()
    {
        return await _datingDbContext.Users
            .ProjectTo<MemberDto>(_mapper.ConfigurationProvider)
            .ToListAsync();
    }

    public async Task<AppUser> GetUserByIdAsync(int id)
    {
        return await _datingDbContext.Users.FindAsync(id);
    }

    public async Task<AppUser> GetUserByUsernameAsync(string username)
    {
        return await _datingDbContext
            .Users
            .Include(p => p.photos)
            .SingleOrDefaultAsync(x => x.UserName == username);
    }

    public async Task<IEnumerable<AppUser>> GetUsersAsync()
    {
        return await _datingDbContext.Users.Include(p => p.photos).ToListAsync();
    }

    public async Task<bool> SaveAllAsync()
    {
        return await _datingDbContext.SaveChangesAsync() > 0;
    }

    public void Update(AppUser user)
    {
        _datingDbContext.Entry(user).State = EntityState.Modified;
    }
}
