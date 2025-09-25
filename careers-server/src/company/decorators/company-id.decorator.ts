import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithUser {
  user?: {
    companyId?: string;
  };
}

export const CompanyId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user?.companyId;
  },
);
