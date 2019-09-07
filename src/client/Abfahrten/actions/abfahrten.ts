import { AbfahrtAPIResult, Departures, Wings } from 'types/abfahrten';
import { AbfahrtenThunkResult } from 'AppState';
import { createAction } from 'deox';
import { FilterOptions } from 'Abfahrten/reducer/abfahrten';
import { getStationsFromAPI } from 'Common/service/stationSearch';
import { setCookieOptions } from 'client/util';
import { Station } from 'types/station';
import { StationSearchType } from 'Common/config';
import axios, { AxiosError } from 'axios';
import Cookies from 'universal-cookie';

export type AbfahrtenError =
  | AbfahrtenError$Redirect
  | AbfahrtenError$404
  | AbfahrtenError$Default;
type AbfahrtenError$Redirect = Error & {
  type: 'redirect';
  redirect: string;
  station?: void;
};

type AbfahrtenError$404 = Error & {
  type: '404';
  station?: void;
};
type AbfahrtenError$Default = AxiosError & {
  type: void;
  station?: string;
};

const Actions = {
  gotAbfahrten: createAction(
    'GOT_ABFAHRTEN',
    resolve => (p: {
      station?: Station;
      departures: Departures;
      wings: Wings;
      lageplan?: null | string;
    }) => resolve(p)
  ),
  gotAbfahrtenError: createAction(
    'GOT_ABFAHRTEN_ERROR',
    resolve => (e: AbfahrtenError) => resolve(e)
  ),
  setDetail: createAction('SET_DETAIL', resolve => (s?: string) => resolve(s)),
  setCurrentStation: createAction(
    'SET_CURRENT_STATION',
    resolve => (s?: Station) => resolve(s)
  ),
  gotLageplan: createAction('GOT_LAGEPLAN', resolve => (s?: string) =>
    resolve(s)
  ),
  setFilterMenu: createAction('SET_FILTER_MENU', resolve => (open: boolean) =>
    resolve(open)
  ),
  setFilterList: createAction(
    'SET_FILTER_LIST',
    resolve => (filterList: string[]) => resolve(filterList)
  ),
  setFilter: createAction('SET_FILTER', resolve => (options: FilterOptions) =>
    resolve(options)
  ),
};

export default Actions;

let cancelGetAbfahrten = () => {};

async function getAbfahrtenFromAPI(
  station: Station,
  lookahead: string,
  lookbehind: string
): Promise<AbfahrtAPIResult> {
  cancelGetAbfahrten();

  const r = await axios.get<AbfahrtAPIResult>(
    `/api/iris/current/abfahrten/${station.id}`,
    {
      cancelToken: new axios.CancelToken(c => {
        cancelGetAbfahrten = c;
      }),
      // @ts-ignore
      station,
      params: {
        lookahead,
        lookbehind,
      },
    }
  );

  return r.data;
}

export const getLageplan = (
  stationName: string
): AbfahrtenThunkResult => async dispatch => {
  const lageplan = (await axios.get(
    `/api/bahnhof/current/lageplan/${stationName}`
  )).data.lageplan;

  dispatch(Actions.gotLageplan(lageplan));

  return lageplan;
};

export const getAbfahrtenByString = (
  stationString?: string,
  searchType?: StationSearchType
): AbfahrtenThunkResult => async (dispatch, getState) => {
  try {
    const config = getState().abfahrtenConfig.config;
    const stations = await getStationsFromAPI(
      stationString,
      searchType || config.searchType
    );

    if (stations.length) {
      const { departures, lookbehind, ...rest } = await getAbfahrtenFromAPI(
        stations[0],
        config.lookahead,
        config.lookbehind
      );

      dispatch(
        Actions.gotAbfahrten({
          station: stations[0],
          departures: {
            lookahead: departures,
            lookbehind,
          },
          ...rest,
        })
      );

      return;
    }
    throw {
      type: '404',
    };
  } catch (e) {
    if (!axios.isCancel(e)) {
      e.station = decodeURIComponent(stationString || '');
      dispatch(Actions.gotAbfahrtenError(e));
    }
  }
};

export const setDetail = (
  cookies: Cookies,
  selectedDetail?: string
): AbfahrtenThunkResult => (dispatch, getState) => {
  const state = getState();
  const detail =
    state.abfahrten.selectedDetail === selectedDetail
      ? undefined
      : selectedDetail;

  if (detail) {
    cookies.set('selectedDetail', detail, setCookieOptions);
  } else {
    cookies.remove('selectedDetail');
  }
  dispatch(Actions.setDetail(detail));
};

export const refreshCurrentAbfahrten = (): AbfahrtenThunkResult => async (
  dispatch,
  getState
) => {
  const state = getState();

  if (!state.abfahrten.currentStation) {
    return;
  }

  const { departures, lookbehind, ...rest } = await getAbfahrtenFromAPI(
    state.abfahrten.currentStation,
    state.abfahrtenConfig.config.lookahead,
    state.abfahrtenConfig.config.lookbehind
  );

  dispatch(
    Actions.gotAbfahrten({
      station: state.abfahrten.currentStation,
      departures: {
        lookahead: departures,
        lookbehind,
      },
      ...rest,
    })
  );
};

export const openFilter = () => Actions.setFilterMenu(true);
export const closeFilter = () => Actions.setFilterMenu(false);
