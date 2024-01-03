﻿using API.DTOs;
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

    public void AddGroup(Group group)
    {
        _datingDbContext.Groups.Add(group);
    }

    public void AddMessage(Message message)
    {
        _datingDbContext.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
        _datingDbContext.Messages.Remove(message);
    }

    public async Task<Connection> GetConnection(string connectionId)
    {
        return await _datingDbContext.Connections.FindAsync(connectionId);
    }

    public async Task<Group> GetGroupForConnection(string connectionId)
    {
        return await _datingDbContext.Groups
            .Include(x => x.Connections)
            .Where(x => x.Connections.Any(c => c.ConnectionId == connectionId))
            .FirstOrDefaultAsync();
    }

    public async Task<Message> GetMessage(int id)
    {
        return await _datingDbContext.Messages.FindAsync(id);
    }

    public async Task<Group> GetMessageGroup(string groupName)
    {
        return await _datingDbContext.Groups
            .Include(x => x.Connections)
            .FirstOrDefaultAsync(x => x.Name == groupName);
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
        var query = _datingDbContext
            .Messages
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
            .AsQueryable();
            

        var unreadMessages = query
            .Where(m => m.DateRead == null && m.RecipientUsername == currentUserName)
            .ToList();

        if (unreadMessages.Any())
        {
            foreach (var message in unreadMessages)
            {
                message.DateRead = DateTime.UtcNow;
            }

        }

        return await query.ProjectTo<MessageDto>(_mapper.ConfigurationProvider).ToListAsync();
    }

    public void RemoveConnection(Connection connection)
    {
        _datingDbContext.Connections.Remove(connection);
    }
}
