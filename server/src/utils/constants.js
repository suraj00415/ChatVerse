export const avatarPlaceholder =
    "https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?w=740&t=st=1711037106~exp=1711037706~hmac=ab8ae30120b2a313e5333846fd30bf1de1cb3cb861b07153e295f4765b471b3d";

export const groupAvatarPlaceholder =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtVVOCm9OwNK1VdbNJ0MR3I1YXT2OZpk0U6A&usqp=CAU";

export const port = process.env.PORT || 8081;

export const option = {
    secure: true,
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
};
export const LogoutOption = {
    secure: true,
    httpOnly: true,
};

export function isBlackOrWhite(color) {
    return /^#(?:00){3}$|^#(?:ff){3}$/i.test(color);
}