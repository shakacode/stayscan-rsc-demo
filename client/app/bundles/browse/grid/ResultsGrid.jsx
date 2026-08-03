import React from 'react';
import { useSelector } from 'react-redux';
import { selectResultTiles, selectIsLoading, selectIsEmpty } from '../selectors/resultSelectors';
import { selectSearchCenter } from '../selectors/mapSelectors';
import ListingTile from '../tile/ListingTile';
import TileSkeleton from '../tile/TileSkeleton';
import ResultsToolbar from './ResultsToolbar';
import EmptyState from './EmptyState';
import Pagination from './Pagination';
import * as style from './grid.module.scss';

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e', 'f'];

// The results grid: toolbar, then skeletons while loading / empty state / the tile
// grid + paginator. Tiles get the search center for their distance line.
export default function ResultsGrid() {
  const isLoading = useSelector(selectIsLoading);
  const isEmpty = useSelector(selectIsEmpty);
  const tiles = useSelector(selectResultTiles);
  const center = useSelector(selectSearchCenter);

  return (
    <div data-test-id="results-grid">
      <ResultsToolbar />

      {isLoading && (
        <ul className={style.grid} aria-busy="true">
          {SKELETON_KEYS.map((key) => (
            <TileSkeleton key={key} />
          ))}
        </ul>
      )}

      {!isLoading && isEmpty && <EmptyState />}

      {!isLoading && !isEmpty && (
        <>
          <ul className={style.grid} data-test-id="results-list">
            {tiles.map((tile) => (
              <ListingTile key={tile.id} tile={tile} center={center} />
            ))}
          </ul>
          <Pagination />
        </>
      )}
    </div>
  );
}
