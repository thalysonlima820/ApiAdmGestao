
export class TokenPayloadDto {
    sub: number;
    nome: string;
    policies: string[];
    iat: number;
    exp: number;
    aud: string;
    iss: string;
}