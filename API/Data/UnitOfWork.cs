using API.Interfaces;
using AutoMapper;

namespace API.Data;

public class UnitOfWork : IUnitOfWork
{
    private readonly DatingDbContext _datingDbContext;
    private readonly IMapper _mapper;

    public UnitOfWork(DatingDbContext datingDbContext, IMapper mapper)
    {
        _datingDbContext = datingDbContext;
        _mapper = mapper;
    }

    public IUserRepository UserRepository => new UserRepository(_datingDbContext, _mapper);

    public IMessageRepository MessageRepository => new MessageRepository(_datingDbContext, _mapper);

    public ILikesRepository LikesRepository => new LikesRepository(_datingDbContext);

    public IPhotoRepository PhotoRepository => new PhotoRepository(_datingDbContext);

    public async Task<bool> Complete()
    {
        return await _datingDbContext.SaveChangesAsync() > 0;
    }

    public bool HasChanges()
    {
        return _datingDbContext.ChangeTracker.HasChanges();
    }
}
