import React from 'react';
import {
  FaSolarPanel, FaSwimmingPool, FaTint, FaHome, FaBath, FaVideo, FaBolt, FaPaintRoller, FaTree, FaHammer,
  FaMagic, FaTools,
} from 'react-icons/fa';

/** One icon per renovation service, from the same set as the rest of the site (no emoji). */
const ICONS = {
  solar: FaSolarPanel,
  pool: FaSwimmingPool,
  borehole: FaTint,
  roofing: FaHome,
  remodel: FaBath,
  security: FaVideo,
  power: FaBolt,
  painting: FaPaintRoller,
  fencing: FaTree,
  extension: FaHammer,
  other: FaMagic,
};

export default function RenovationIcon({ service, ...rest }) {
  const Icon = ICONS[service] || FaTools;
  return <Icon aria-hidden="true" {...rest} />;
}
