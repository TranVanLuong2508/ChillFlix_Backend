import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubscriptionPlansService } from './subscription-plans.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { ResponseMessage, SkipCheckPermission, User } from 'src/decorators/customize';
import type { IUser } from '../users/interface/user.interface';

@Controller('subscription-plans')
export class SubscriptionPlansController {
  constructor(private readonly subscriptionPlansService: SubscriptionPlansService) {}

  @Post()
  @ResponseMessage('Create a subscription plan')
  create(@Body() createSubscriptionPlanDto: CreateSubscriptionPlanDto, @User() user: IUser) {
    return this.subscriptionPlansService.create(createSubscriptionPlanDto, user);
  }

  @Get()
  @ResponseMessage('Fetch all subscription plans')
  findAll() {
    return this.subscriptionPlansService.findAll();
  }

  @Get(':id')
  @ResponseMessage('Fetch a subscription plan by id')
  findOne(@Param('id') id: string) {
    return this.subscriptionPlansService.findOne(+id);
  }

  @Patch(':id')
  @ResponseMessage('Update a subscription plan by id')
  update(@Param('id') id: string, @Body() updateSubscriptionPlanDto: UpdateSubscriptionPlanDto, @User() user: IUser) {
    return this.subscriptionPlansService.update(+id, updateSubscriptionPlanDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a subscription plan')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.subscriptionPlansService.remove(+id, user);
  }
}
