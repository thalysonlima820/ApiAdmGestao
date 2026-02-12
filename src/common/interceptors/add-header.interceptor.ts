import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import {version} from '../../../package.json'
@Injectable()
export class AddHeaderInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler<any>) {
        const res = context.switchToHttp().getResponse()

        res.setHeader('Versao-Api', version)

        return next.handle()
    }
}