import {
  Controller,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../authorization/guards/role.guard';
import { Roles } from '../common/decorators';
import { Role } from '../common/enums';

@ApiTags('Recommendation')
@Controller('recommendation')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Post('trigger/content-based')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Trigger content-based training',
    description:
      'Triggers a content-based recalculation of recommendations. ' +
      'Only available to administrators due to the potentially heavy computational load.',
  })
  @ApiOkResponse({ description: 'Training triggered successfully.' })
  @ApiInternalServerErrorResponse({
    description: 'Failed to trigger recommendation training',
  })
  async triggerFullContentBasedRecalculation() {
    try {
      await this.recommendationService.triggerFullContentBasedRecalculation();
    } catch {
      throw new InternalServerErrorException(
        'Failed to trigger recommendation training',
      );
    }
  }

  @Post('trigger/collaborative')
  @UseGuards(AuthGuard('jwt'), RoleGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Trigger collaborative filtering training',
    description:
      'Triggers a full recalculation of the collaborative filtering recommendation model. ' +
      'Only available to administrators due to the potentially heavy computational load.',
  })
  @ApiOkResponse({
    description: 'Collaborative filtering training triggered successfully.',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to trigger collaborative filtering training',
  })
  async triggerFullCollaborativeTraining() {
    try {
      await this.recommendationService.triggerFullCollaborativeRecalculation();
    } catch {
      throw new InternalServerErrorException(
        'Failed to trigger collaborative filtering training',
      );
    }
  }
}
