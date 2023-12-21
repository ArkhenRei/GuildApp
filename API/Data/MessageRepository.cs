using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class MessageRepository : IMessageRepository
{
    private readonly DatingDbContext _datingDbContext;
    private readonly IMapper _mapper;

    public MessageRepository(DatingDbContext datingDbContext, IMapper mapper)
    {
        _datingDbContext = datingDbContext;
        _mapper = mapper;
    }

    public void AddMessage(Message message)
    {
        _datingDbContext.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
        _datingDbContext.Messages.Remove(message);
    }

    public async Task<Message> GetMessage(int id)
    {
        return await _datingDbContext.Messages.FindAsync(id);
    }

    public async Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
    {
        var query = _datingDbContext.Messages.OrderByDescending(x => x.MessageSent).AsQueryable();

        query = messageParams.Container switch
        {
            "Inbox"
                => query.Where(
                    u =>
                        u.RecipientUsername == messageParams.Username && u.RecipientDeleted == false
                ),
            "Outbox"
                => query.Where(
                    u => u.SenderUsername == messageParams.Username && u.SenderDeleted == false
                ),
            _
                => query.Where(
                    u =>
                        u.RecipientUsername == messageParams.Username
                        && u.RecipientDeleted == false
                        && u.DateRead == null
                )
        };

        var messages = query.ProjectTo<MessageDto>(_mapper.ConfigurationProvider);

        return await PagedList<MessageDto>.CreateAsync(
            messages,
            messageParams.PageNumber,
            messageParams.PageSize
        );
    }

    public async Task<IEnumerable<MessageDto>> GetMessageThread(
        string currentUserName,
        string recipientUserName
    )
    {
        var messages = await _datingDbContext
            .Messages
            .Include(u => u.Sender)
            .ThenInclude(p => p.photos)
            .Include(u => u.Recipient)
            .ThenInclude(p => p.photos)
            .Where(
                m =>
                    m.RecipientUsername == currentUserName
                        && m.RecipientDeleted == false
                        && m.SenderUsername == recipientUserName
                    || m.RecipientUsername == recipientUserName
                        && m.SenderDeleted == false
                        && m.SenderUsername == currentUserName
            )
            .OrderBy(m => m.MessageSent)
            .ToListAsync();

        var unreadMessages = messages
            .Where(m => m.DateRead == null && m.RecipientUsername == currentUserName)
            .ToList();

        if (unreadMessages.Any())
        {
            foreach (var message in unreadMessages)
            {
                message.DateRead = DateTime.UtcNow;
            }

            await _datingDbContext.SaveChangesAsync();
        }

        return _mapper.Map<IEnumerable<MessageDto>>(messages);
    }

    public async Task<bool> SaveAllAsync()
    {
        return await _datingDbContext.SaveChangesAsync() > 0;
    }
}
