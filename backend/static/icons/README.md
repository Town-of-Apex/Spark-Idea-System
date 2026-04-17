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

## Updating or Adding Badges

To add or change a badge, you need to update three things:

1.  **`backend/badges.json`**: Update the `id`, `name`, and `description`.
    *   *Note: I have updated `dev.sh` so the server now auto-reloads when you save this file.*
2.  **`backend/static/icons/`**: Ensure there is an SVG file that matches the **`id`** exactly (e.g., `my_new_badge.svg`).
3.  **Database (if renaming)**: If you change an existing `id`, users who already earned the old badge won't see it until the database is updated. You can run a simple SQL command or just let them "re-earn" it by sharing another Spark.

## Fallback

If a file named `{badge_id}.svg` doesn't exist, the page automatically
falls back to `placeholder.svg` (the medal shape). The `onerror` attribute handles this on each `<img>` tag in `profile.html`.
