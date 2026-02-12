import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseIntIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param' || metadata.data !== 'id') {
      return value;
    }

    const parseValue = Number(value);

    if (isNaN(parseValue)) {
      throw new BadRequestException('nao e numero');
    }
    if (parseValue <= 0) {
      throw new BadRequestException('numeroe interior');
    }
    return parseValue;
  }
}
