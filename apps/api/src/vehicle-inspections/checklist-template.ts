import { ChecklistCategory } from '@prisma/client';

/**
 * Default checklist seeded into every new inspection. The inspector can
 * still add / remove / reorder items per inspection. This list captures the
 * "standard sweep" the team has converged on; refine it here and future
 * inspections will start from the updated baseline.
 *
 * Ordering within a category mirrors the on-yard walk-around so the
 * inspector flows naturally from one item to the next.
 */
export const DEFAULT_CHECKLIST: ReadonlyArray<{
  category: ChecklistCategory;
  part: string;
}> = [
  // ── 1. FRONT END ──────────────────────────────────────────────────
  { category: 'FRONT_END', part: 'Hood — alignment, dents, gaps' },
  { category: 'FRONT_END', part: 'Front bumper' },
  { category: 'FRONT_END', part: 'Grille' },
  { category: 'FRONT_END', part: 'Headlights — broken, missing, fogged' },
  { category: 'FRONT_END', part: 'Radiator support (visible)' },
  { category: 'FRONT_END', part: 'Radiator' },
  { category: 'FRONT_END', part: 'A/C condenser' },
  { category: 'FRONT_END', part: 'Intercooler (if turbo)' },
  { category: 'FRONT_END', part: 'Front frame rails — bending / deformation' },
  { category: 'FRONT_END', part: 'Front airbags deployed?' },

  // ── 2. SIDE PANELS ────────────────────────────────────────────────
  { category: 'SIDE_PANELS', part: 'Doors — alignment and gaps' },
  { category: 'SIDE_PANELS', part: 'Doors — open / close behavior' },
  { category: 'SIDE_PANELS', part: 'Fenders (front + rear)' },
  { category: 'SIDE_PANELS', part: 'Side mirrors' },
  { category: 'SIDE_PANELS', part: 'Door handles' },
  { category: 'SIDE_PANELS', part: 'Moldings and trims' },
  { category: 'SIDE_PANELS', part: 'Side windows condition' },
  { category: 'SIDE_PANELS', part: 'A / B / C pillars — visible alignment' },
  { category: 'SIDE_PANELS', part: 'Side curtain airbags deployed?' },
  { category: 'SIDE_PANELS', part: 'Side impact damage (push-in / push-out)' },

  // ── 3. REAR END ───────────────────────────────────────────────────
  { category: 'REAR_END', part: 'Trunk / hatch alignment' },
  { category: 'REAR_END', part: 'Rear bumper' },
  { category: 'REAR_END', part: 'Taillights' },
  { category: 'REAR_END', part: 'Trunk floor (visible / lifted)' },
  { category: 'REAR_END', part: 'Rear frame rails (underneath)' },
  { category: 'REAR_END', part: 'Tow hook (if bent)' },
  { category: 'REAR_END', part: 'Rear glass condition' },

  // ── 4. WHEELS & SUSPENSION ────────────────────────────────────────
  { category: 'WHEELS_SUSPENSION', part: 'Tire wear — uneven / flat' },
  { category: 'WHEELS_SUSPENSION', part: 'Bent rims' },
  { category: 'WHEELS_SUSPENSION', part: 'Wheel camber — visible tilt' },
  { category: 'WHEELS_SUSPENSION', part: 'Vehicle sitting level' },
  { category: 'WHEELS_SUSPENSION', part: 'Shocks / struts — visible collapse' },
  { category: 'WHEELS_SUSPENSION', part: 'Bent control arms' },
  { category: 'WHEELS_SUSPENSION', part: 'CV axles — alignment' },

  // ── 5. INTERIOR ───────────────────────────────────────────────────
  { category: 'INTERIOR', part: 'Deployed airbags (steering / dash / sides)' },
  { category: 'INTERIOR', part: 'Dashboard — cracked / lifted' },
  { category: 'INTERIOR', part: 'Steering wheel airbag present' },
  { category: 'INTERIOR', part: 'Seats — tears, burns, water damage' },
  { category: 'INTERIOR', part: 'Moisture / mold signs' },
  { category: 'INTERIOR', part: 'Rust inside cabin' },
  { category: 'INTERIOR', part: 'Seatbelt pretensioners triggered?' },
  { category: 'INTERIOR', part: 'Door panels damage' },
  { category: 'INTERIOR', part: 'Carpet / flooring condition' },
  { category: 'INTERIOR', part: 'Headliner condition' },

  // ── 6. ENGINE BAY ─────────────────────────────────────────────────
  { category: 'ENGINE_BAY', part: 'Visible oil leaks' },
  { category: 'ENGINE_BAY', part: 'Visible coolant leaks' },
  { category: 'ENGINE_BAY', part: 'Broken hoses / wiring' },
  { category: 'ENGINE_BAY', part: 'Wiring harness damage' },
  { category: 'ENGINE_BAY', part: 'Battery — present and intact' },
  { category: 'ENGINE_BAY', part: 'Engine sits straight (motor mounts ok)' },
  { category: 'ENGINE_BAY', part: 'Radiator damage' },
  { category: 'ENGINE_BAY', part: 'Cooling fans' },

  // ── 7. UNDERBODY ──────────────────────────────────────────────────
  { category: 'UNDERBODY', part: 'Fluid leaks on the ground' },
  { category: 'UNDERBODY', part: 'Bent subframe' },
  { category: 'UNDERBODY', part: 'Exhaust system — hanging or damaged' },
  { category: 'UNDERBODY', part: 'Differential' },
  { category: 'UNDERBODY', part: 'Axles — bent' },
  { category: 'UNDERBODY', part: 'Heavy rust (especially flood / northern)' },

  // ── 8. LIGHTING / ELECTRICAL ──────────────────────────────────────
  { category: 'LIGHTING_ELECTRICAL', part: 'Headlights / taillights — working' },
  { category: 'LIGHTING_ELECTRICAL', part: 'Turn signals' },
  { category: 'LIGHTING_ELECTRICAL', part: 'Aftermarket LED quality / install' },
  { category: 'LIGHTING_ELECTRICAL', part: 'Light housing condensation' },
  { category: 'LIGHTING_ELECTRICAL', part: 'Parking sensors / cameras' },

  // ── 9. REPAIR / BODYWORK SIGNS ────────────────────────────────────
  { category: 'REPAIR_BODYWORK', part: 'Paint shade differences between panels' },
  { category: 'REPAIR_BODYWORK', part: 'New / stripped bolts on bumpers' },
  { category: 'REPAIR_BODYWORK', part: 'Fresh clips or plastic parts' },
  { category: 'REPAIR_BODYWORK', part: 'Welding marks / cuts' },
  { category: 'REPAIR_BODYWORK', part: 'New seals on doors / hood' },
  { category: 'REPAIR_BODYWORK', part: 'Airbags hidden behind covers' },

  // ── 10. FLOOD DAMAGE ──────────────────────────────────────────────
  { category: 'FLOOD_DAMAGE', part: 'Water lines inside doors / panels' },
  { category: 'FLOOD_DAMAGE', part: 'Rust on interior bolts / brackets' },
  { category: 'FLOOD_DAMAGE', part: 'Fogged headlights with water inside' },
  { category: 'FLOOD_DAMAGE', part: 'Wet / stained seatbelts' },
  { category: 'FLOOD_DAMAGE', part: 'Dirt inside seat rails' },
  { category: 'FLOOD_DAMAGE', part: 'Strong mildew smell' },

  // ── 11. FLUIDS ────────────────────────────────────────────────────
  { category: 'FLUIDS', part: 'Engine oil — level' },
  { category: 'FLUIDS', part: 'Engine oil — color / contamination' },
  { category: 'FLUIDS', part: 'Engine oil — smell (gas / burnt)' },
  { category: 'FLUIDS', part: 'Coolant — level and color' },
  { category: 'FLUIDS', part: 'Transmission fluid — level / color / smell' },
  { category: 'FLUIDS', part: 'Brake fluid' },
  { category: 'FLUIDS', part: 'Power steering fluid' },
  { category: 'FLUIDS', part: 'Washer fluid' },

  // ── 12. SENSORY ───────────────────────────────────────────────────
  { category: 'SENSORY', part: 'Cabin smell — mold / smoke / gas / burnt' },
  { category: 'SENSORY', part: 'Exterior smell — fluids / smoke' },
  { category: 'SENSORY', part: 'Engine noises at idle' },
  { category: 'SENSORY', part: 'Engine noises while revving' },
  { category: 'SENSORY', part: 'Exhaust note / smoke color' },
  { category: 'SENSORY', part: 'Vibrations at idle' },

  // ── 13. START BEHAVIOR ────────────────────────────────────────────
  { category: 'START_BEHAVIOR', part: 'Cold start behavior' },
  { category: 'START_BEHAVIOR', part: 'Hot start behavior' },
  { category: 'START_BEHAVIOR', part: 'Idle quality (smooth vs rough)' },
  { category: 'START_BEHAVIOR', part: 'Time to crank' },
  { category: 'START_BEHAVIOR', part: 'Dashboard warning lights at start' },
  { category: 'START_BEHAVIOR', part: 'Engine warm-up behavior' },
];
