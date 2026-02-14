import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { REQUEST_TOKEN_PAYLOAD_KEY } from "../auth.constants";

export const TokenPayloadParam = createParamDecorator (
    (data: unknown, ctx: ExecutionContext) => {
        const context = ctx.switchToHttp();
        const reque: Request = context.getRequest()
        return reque[REQUEST_TOKEN_PAYLOAD_KEY]
    }
)