using System.Security.Cryptography;
using System.Text;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AccountController : BaseApiController
{
    private readonly DatingDbContext _datingDbContext;
    private readonly ITokenService _tokenService;
    private readonly IMapper _mapper;

    public AccountController(DatingDbContext datingDbContext, ITokenService tokenService, IMapper mapper)
    {
        _tokenService = tokenService;
        _mapper = mapper;
        _datingDbContext = datingDbContext;
    }

    [HttpPost("register")] // api/account/register
    public async Task<ActionResult<UserDto>> Register(RegisterDto registerDto)
    {
        if (await UserExists(registerDto.Username))
            return BadRequest("Username is taken");

        var user = _mapper.Map<AppUser>(registerDto);

        using var hmac = new HMACSHA512();

        user.UserName = registerDto.Username;
        user.PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password));
        user.PasswordSalt = hmac.Key;

        _datingDbContext.Users.Add(user);
        await _datingDbContext.SaveChangesAsync();

        return new UserDto { Username = user.UserName, Token = _tokenService.CreateToken(user), KnownAs = user.KnownAs };
    }

    [HttpPost("login")]
    public async Task<ActionResult<UserDto>> Login(LoginDto loginDto)
    {
        var user = await _datingDbContext
            .Users
            .Include(p => p.photos)
            .SingleOrDefaultAsync(x => x.UserName == loginDto.Username);

        if (user == null)
            return Unauthorized("invalid username");

        using var hmac = new HMACSHA512(user.PasswordSalt);

        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));

        for (int i = 0; i < computedHash.Length; i++)
        {
            if (computedHash[i] != user.PasswordHash[i])
                return Unauthorized("invalid password");
        }

        return new UserDto
        {
            Username = user.UserName,
            Token = _tokenService.CreateToken(user),
            PhotoUrl = user.photos.FirstOrDefault(x => x.IsMain)?.Url,
            KnownAs = user.KnownAs
        };
    }

    private async Task<bool> UserExists(string username)
    {
        return await _datingDbContext.Users.AnyAsync(x => x.UserName == username.ToLower());
    }
}
