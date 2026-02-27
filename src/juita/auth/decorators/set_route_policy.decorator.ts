import { SetMetadata } from '@nestjs/common';
import { ROUTE_POLICY_KEY } from '../auth.constants';
import { RoutePolicy } from '../enum/route-policy.enum';

export const SetRoutePolicy = (policy: RoutePolicy) => {
  return SetMetadata(ROUTE_POLICY_KEY, policy);
};
