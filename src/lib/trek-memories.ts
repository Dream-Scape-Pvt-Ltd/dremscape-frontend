// Original photographs supplied by the Dreamscape team. No invented trip dates or identities.
export type MemoryPhoto={id:string;title:string;alt:string;group:string;src:string;width:number;height:number};
export const memoryPhotos:MemoryPhoto[]=[
  {
    "id": "together-in-the-mountains",
    "title": "The people beside you",
    "alt": "A trekking group standing together beneath snow-covered mountains.",
    "group": "Shared trails",
    "src": "/images/trek-memories/together-in-the-mountains.jpg",
    "width": 2048,
    "height": 1536
  },
  {
    "id": "prayer-flags-and-friends",
    "title": "A moment at the top",
    "alt": "Trekkers gathered beside a viewpoint marker under colourful prayer flags.",
    "group": "Shared trails",
    "src": "/images/trek-memories/prayer-flags-and-friends.jpg",
    "width": 1536,
    "height": 2048
  },
  {
    "id": "forest-footsteps",
    "title": "Into the green",
    "alt": "Trekkers following a rocky footpath through dense forest.",
    "group": "Along the way",
    "src": "/images/trek-memories/forest-footsteps.jpg",
    "width": 1536,
    "height": 2048
  },
  {
    "id": "village-street",
    "title": "A village beneath the peaks",
    "alt": "Colourful buildings lining a village street beneath snowy mountains.",
    "group": "Along the way",
    "src": "/images/trek-memories/village-street.jpg",
    "width": 2048,
    "height": 1536
  },
  {
    "id": "last-light",
    "title": "A little longer in the light",
    "alt": "Warm pink light touching a mountain summit above dark ridges.",
    "group": "Mountain light",
    "src": "/images/trek-memories/last-light.jpg",
    "width": 2048,
    "height": 1536
  },
  {
    "id": "a-pause-on-the-ridge",
    "title": "Room to pause",
    "alt": "Walkers resting on an open hillside with a snow-covered range behind them.",
    "group": "Shared trails",
    "src": "/images/trek-memories/a-pause-on-the-ridge.jpg",
    "width": 2048,
    "height": 1536
  },
  {
    "id": "mountain-teahouse",
    "title": "A door along the trail",
    "alt": "A small blue-trimmed mountain building beside an outdoor table.",
    "group": "Along the way",
    "src": "/images/trek-memories/mountain-teahouse.jpg",
    "width": 2048,
    "height": 1536
  },
  {
    "id": "blue-doorway",
    "title": "The details that stay",
    "alt": "A sunlit turquoise doorway and handwritten signs at a mountain lodge.",
    "group": "Along the way",
    "src": "/images/trek-memories/blue-doorway.jpg",
    "width": 2048,
    "height": 1536
  },
  {
    "id": "blue-flowers",
    "title": "Small discoveries",
    "alt": "Small blue flowers growing among dry leaves beside the trail.",
    "group": "Along the way",
    "src": "/images/trek-memories/blue-flowers.jpg",
    "width": 1536,
    "height": 2048
  },
  {
    "id": "yak-on-the-trail",
    "title": "Company of a different kind",
    "alt": "A long-haired yak grazing on a dry mountain hillside.",
    "group": "Along the way",
    "src": "/images/trek-memories/yak-on-the-trail.jpg",
    "width": 1536,
    "height": 2048
  },
  {
    "id": "ridge-walkers",
    "title": "A path through the sky",
    "alt": "A line of trekkers on a rocky ridge beside prayer flags.",
    "group": "Shared trails",
    "src": "/images/trek-memories/ridge-walkers.jpg",
    "width": 1536,
    "height": 2048
  },
  {
    "id": "stone-path",
    "title": "One step, then another",
    "alt": "Trekkers walking a stone path towards a bright mountain backdrop.",
    "group": "Shared trails",
    "src": "/images/trek-memories/stone-path.jpg",
    "width": 1536,
    "height": 2048
  },
  {
    "id": "forest-light",
    "title": "Under the canopy",
    "alt": "Sunlight falling through trees onto trekkers on a forest path.",
    "group": "Along the way",
    "src": "/images/trek-memories/forest-light.jpg",
    "width": 1536,
    "height": 2048
  },
  {
    "id": "woodland-trail",
    "title": "The quieter miles",
    "alt": "A rough woodland trail passing between slender trees.",
    "group": "Along the way",
    "src": "/images/trek-memories/woodland-trail.jpg",
    "width": 1536,
    "height": 2048
  },
  {
    "id": "valley-tree",
    "title": "A view through the branches",
    "alt": "A tall tree overlooking layers of blue mountain valleys.",
    "group": "Mountain light",
    "src": "/images/trek-memories/valley-tree.jpg",
    "width": 1536,
    "height": 2048
  },
  {
    "id": "high-trail",
    "title": "Looking back on the climb",
    "alt": "Trekkers pausing on a steep rocky trail beside prayer flags.",
    "group": "Shared trails",
    "src": "/images/trek-memories/high-trail.jpg",
    "width": 1536,
    "height": 2048
  },
  {
    "id": "mountain-path",
    "title": "The next bend",
    "alt": "A walker on a dry hillside path below a bright snow-covered peak.",
    "group": "Shared trails",
    "src": "/images/trek-memories/mountain-path.jpg",
    "width": 1536,
    "height": 2048
  },
  {
    "id": "sunlit-summits",
    "title": "Light across the skyline",
    "alt": "Sunlit snow peaks rising above a shadowed valley under a blue sky.",
    "group": "Mountain light",
    "src": "/images/trek-memories/sunlit-summits.jpg",
    "width": 2048,
    "height": 1536
  }
];
export function memoryPhoto(id:string):MemoryPhoto {const photo=memoryPhotos.find(p=>p.id===id);if(!photo)throw new Error('Unknown archive photo: '+id);return photo;}
