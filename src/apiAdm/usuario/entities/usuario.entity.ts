import { RoutePolicy } from 'src/auth/enum/route-policy.enum';
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity({ name: 'SITEUSUARIO' })
export class SITEUSUARIO {
  @PrimaryColumn({ length: 50 })
  CODUSUARIO: string;

  @Column()
  EMAIL: string;

  @Column()
  SENHA: string;

  @Column()
  NOME: string;

  @Column()
  ACTIVE: boolean;

  @Column({ type: 'simple-array' })
  ROUTEPOLICIES: RoutePolicy[];

  @Column()
  IDTELEGRAM: string;

  @Column()
  ULTIMO_LOGIN: string;
}
