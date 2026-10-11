# Society World Map Layout & Anchor Specification

> **Document Type:** Agent B Map & Scene Specification  
> **Status:** Finalized (Wave 1)  
> **Coordinate System:** Three.js standard (X: West [-] to East [+], Y: Up [+], Z: North [-] to South [+])

---

## 1. Spatial Zones & Layout Concept

The Society world is an Indian gated residential society complex designed with a 36m × 36m playable footprint (`X: [-18, +18]`, `Z: [-18, +18]`).

```
                Z = -18 (North Perimeter Wall)
      ┌────────────────────────────────────────────────────────┐
      │  [Tower A]       [Service Lane & Waste Pile] [Tower B] │
      │  (-10, 0, -12)   (X: +6, Z: -10)             (+10, -12)│
      │                                                        │
      │  [Clubhouse]     [Central Park & Garden]     [Internal │
      │  (-12, 0, 0)     (X: 0 to 4, Z: -2 to +4)    Driveway  │
      │                  (Plant slots & flora)       Road]     │
      │                                              (X: +14)  │
      │                                                        │
      │  [Playground]    [Main Entrance Plaza]                 │
      │  (-10, 0, +8)    Kai Spawn: (0, 0, +12)                │
      │                  [Security Cabin] & [Main Gate]        │
      └────────────────────────────────────────────────────────┘
                Z = +18 (South Main Gate / Road)
```

---

## 2. Master Anchor Table

| Anchor Name | Coordinates (X, Y, Z) | Visual / Functional Role |
| :--- | :--- | :--- |
| `playerStart` | `(0.0, 0.0, 12.0)`, rotY = 0 | Kai spawns inside main entrance facing North into the complex |
| `introCamera` | `(0.0, 3.8, 16.0)` -> `(0.0, 1.2, 12.0)` | Close framing of Kai welcoming the player |
| `cinematicCamera` | `(12.0, 14.0, 16.0)` -> `(0.0, 0.0, 0.0)` | High-angle panoramic establishing view of the society |
| `pile` | `(6.0, 0.0, -10.0)`, radius = 3.5m | Rear service lane waste dump heap |
| `itemSpawnRegion` | `(6.0, 0.0, -10.0)`, radius = 5.0m | 15 scattered litter items around pile |
| `sackPositions.wet` | `(3.5, 0.0, -7.5)` | Green temporary wet waste sack |
| `sackPositions.dry` | `(5.5, 0.0, -7.5)` | Blue temporary dry recyclables sack |
| `sackPositions.hazardous` | `(7.5, 0.0, -7.5)` | Red temporary hazardous waste sack |
| `sackPositions.residual` | `(9.5, 0.0, -7.5)` | Black temporary residual waste sack |
| `truckSpawn` | `(14.0, 0.0, 24.0)` | Off-screen road south of driveway |
| `truckRoute` | `[(14, 0, 18), (14, 0, 6), (14, 0, -4)]` | Path straight along Eastern internal driveway |
| `truckStop` | `(14.0, 0.0, -8.0)` | Halting spot adjacent to service lane pile |
| `gardenBounds` | `min: (-2, -4)`, `max: (8, 6)` | Central park with walking path |
| `residentEntry` | `(0.0, 0.0, 14.0)` | Society gate entrance point for visitors |
| `residentStandPoint` | `(0.0, 0.0, 4.0)` | Plaza center where residents gather for quiz |

---

## 3. Bin Spot Candidates (Shared Rule Verification)

1. **`main_gate`** `(3.0, 0.0, 12.0)` — **Valid**: Clear of roadway, high visibility, accessible to collectors.
2. **`central_park_entry`** `(-3.0, 0.0, 2.0)` — **Valid**: On perimeter of park paver walk, 3m from flower beds.
3. **`clubhouse_plaza`** `(-8.0, 0.0, -2.0)` — **Valid**: Broad open plaza in front of community center.
4. **`flower_bed_center`** `(2.0, 0.0, 1.0)` — **Invalid**: Inside garden flower bed, violates plant clearance rule.
5. **`narrow_driveway`** `(14.0, 0.0, 4.0)` — **Invalid**: Inside vehicle driveway, blocks garbage collection van.
6. **`service_lane_corner`** `(10.0, 0.0, -8.0)` — **Valid**: Utility junction near collection point.

---

## 4. Visual State Progression

* **State 0 (Dirty)**: Parched earth tone (`#5a4838`), brown wilted foliage on plant slots, active pest particle cloud hovering over waste pile.
* **State 1 (Clean)**: Cleared grounds (`#4a7c59`), waste pile removed, pest particle cloud deactivated.
* **State 2 (Revived)**: Lush emerald lawn (`#2e8b57`), bright floral blossoms instantiated at all 6 plant slots, fluttering butterfly particles.
