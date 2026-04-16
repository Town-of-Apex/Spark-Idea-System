# Badge Icons — `backend/static/icons/`

Each badge in the system maps to an SVG icon stored in this folder.
The profile page loads icons using the badge's `id` field as the filename.

## File Naming

```
/static/icons/{badge_id}.svg
```

## Badge ID → Icon Mapping

| Badge ID | Badge Name | Suggested Icon |
|---|---|---|
| `spark_plug` | Spark Plug | Zap / lightning bolt |
| `human_tesla_coil` | Human Tesla Coil | Flame |
| `kingmaker` | The Kingmaker | Crown |
| `serial_clicker` | Serial Clicker | Mouse pointer |
| `department_pioneer` | Department Pioneer | Trophy |
| `opinionated_citizen` | Opinionated Citizen | Target / bullseye |
| `democracy_manifest` | Democracy Manifest | Gavel |
| `idea_archmage` | Idea Archmage | Magic wand |
| `resident_regular` | Resident Regular | Coffee mug |
| `the_ghost_in_the_machine` | Ghost in the Machine | Ghost |

## Adding Your Own Icons

1. Find or create a 24×24 viewBox SVG (Lucide, Heroicons, or custom).
2. Save it as `{badge_id}.svg` in this folder.
3. For consistency with the Apex Modern design, use these stroke/fill guidelines:
   - **Achieved badge**: `stroke="#005a70"` (brand teal) on a light fill
   - **Locked badge** (CSS handles this): the image is greyscaled via filter

## Fallback

If a file named `{badge_id}.svg` doesn't exist, the page automatically
falls back to `placeholder.svg` (the medal shape currently in this folder).
The `onerror` attribute handles this on each `<img>` tag in `profile.html`.
