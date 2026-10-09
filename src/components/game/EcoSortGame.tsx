import React from 'react';
import { WorldPage, WorldPageProps } from '../world/WorldPage';

export interface EcoSortGameProps extends WorldPageProps {}

export const EcoSortGame: React.FC<EcoSortGameProps> = (props) => {
  return <WorldPage {...props} />;
};

export default EcoSortGame;
