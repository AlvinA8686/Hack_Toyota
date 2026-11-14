# Vehicle model photos

The home account card and garage use bundled catalog photos selected by the synthetic account's model year and model. All 20 customer profiles are covered by 18 distinct model/year images. Color and trim can differ from a specific account, which is disclosed beside the photo.

Image origins are recorded in `assets/vehicles/sources.json` with the source page and original image URL. Sources include Toyota's image service, Toyota dealer model catalogs, Cars.com, Carvana, and Kelley Blue Book. Images retain their original bytes; ownership remains with the respective image providers.

`src/ui/VehiclePhoto.tsx` explicitly references each local image so Metro includes them in iOS and web bundles. Displaying a vehicle photo requires no external image request at runtime. `scripts/download_vehicle_assets.py` and its source manifest record how the collection was retrieved.
