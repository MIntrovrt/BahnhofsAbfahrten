import { AbfahrtenResult, WingDefinition } from 'types/iris';
import { Controller, Get, Query, Route, Tags } from 'tsoa';
import { getAbfahrten } from 'server/Abfahrten';
import { noncdAxios, openDataAxios } from 'server/Abfahrten/helper';
import wingInfo from 'server/Abfahrten/wings';

@Route('/iris/v1')
export class IrisController extends Controller {
  @Get('/wings/{rawId1}/{rawId2}')
  @Tags('IRIS V1')
  wings(rawId1: string, rawId2: string): Promise<WingDefinition> {
    return wingInfo(rawId1, rawId2);
  }

  @Get('/abfahrten/{evaId}')
  @Tags('IRIS V1')
  abfahrten(
    evaId: string,
    /**
     * in Minutes
     */
    @Query() lookahead?: number,
    /**
     * in Minutes
     */
    @Query() lookbehind?: number,
    @Query() type?: 'open' | 'default'
  ): Promise<AbfahrtenResult> {
    if (evaId.length < 6) {
      throw {
        status: 400,
        message: 'Please provide a evaID',
      };
    }

    return getAbfahrten(
      evaId,
      true,
      {
        lookahead,
        lookbehind,
      },
      type === 'open' ? openDataAxios : noncdAxios
    );
  }
}
