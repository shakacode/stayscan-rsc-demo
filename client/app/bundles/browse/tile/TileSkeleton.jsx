import React from 'react';
import Skeleton from '../../../styleguide/components/Skeleton/Skeleton';
import * as style from './tile.module.scss';

// Placeholder tile shown while a page of results is loading.
export default function TileSkeleton() {
  return (
    <div className={style.skeleton} data-test-id="tile-skeleton" aria-hidden="true">
      <div className={style.skeletonImg} />
      <div className={style.skeletonBody}>
        <Skeleton className={style.skeletonLine} />
        <Skeleton className={`${style.skeletonLine} ${style.skeletonLineShort}`} />
        <Skeleton className={style.skeletonLine} />
      </div>
    </div>
  );
}
