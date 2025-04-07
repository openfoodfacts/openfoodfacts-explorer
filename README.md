<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-dark.png?refresh_github_cache=1">
  <source media="(prefers-color-scheme: light)" srcset="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.png?refresh_github_cache=1">
  <img height="48" src="https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.svg">
</picture>
<br>

# Open Food Facts Explorer: the modern JS frontend to Open Food Facts

## Warning
- Please ask assignment before starting to code. First asking, first assigned. We have enough issues for everyone. Please open a matching issue and get consensus before raising PRs.
- DO NOT create a bug and its PR at the same time. Create the issue first and ask to be assigned.
- Do not try to race other contributors to solving an issue. Try something else, or try collaborating or helping one another on solving it.
- DO NOT jump to implement an open issue before an agreement is reached on the design.
- LINT your PRs before sending them pnpm
- Please mention GenAI tool you used if you used it (Copilot in an IDE, Copilot Workspace, Gemini…)

## Design
- openfoodfacts-explorer is our experimental, next gen frontend. The idea is to reach feature parity on the essential stuff with the main frontend to eventually replace it, with a much better responsive UI (80%+ of our traffic is mobile web). 
- We currently don’t have any real visual mockup of it, nor “artistic direction” so for the time being, we're copying key features from the current frontend, improving them whenever we can.
- [![Figma](https://img.shields.io/badge/figma-%23F24E1E.svg?logo=figma&logoColor=white) Mockups on the current website]([https://www.figma.com/design/Qg9URUyrjHgYmnDHXRsTTB/Current-Website-design?m=auto&t=RokuCr1uXrGFMhTB-6](https://www.figma.com/design/Qg9URUyrjHgYmnDHXRsTTB/Current-Website-design?m=auto&t=RokuCr1uXrGFMhTB-6))
- [![Sketch](https://img.shields.io/badge/Sketch-%23F24E1E.svg?logo=sketch&logoColor=white) Trying to create a digital twin of openfoodfacts-explorer](https://www.figma.com/design/pgWZAEX1ZoTt0f7Azek4AV/Open-Food-Facts-Explorer-(next-gen-frontend)?node-id=1-53&t=XfEkgmUsvs6qiKr9-0)

## Features

- Uses the [official Open Food Facts NodeJS SDK](https://github.com/openfoodfacts/openfoodfacts-nodejs)
- Basic editing
- Product page display, including Knowledge Panels support
- Search
- Login support (simple login)
- Folksonomy Engine Support

## Roadmap
- [ ] Using more openfoodfacts-nodejs
- [ ] Using more openfoodfacts-webcomponents
- [ ] Image editing and image upload
- [ ] Product Addition
- [ ] Support for [Open Prices](https://prices.openfoodfacts.org/)
- [ ] Support for [Search-A-Licious](https://search.openfoodfacts.org/docs) (including facets)
- [ ] Support for Nutri-Patrol
- [ ] Support for static content (eg /discover, /contribute…)

## Get in touch
- You can also join the #off-explorer channel on the Open Food Facts Slack: https://slack.openfoodfacts.org


## Weekly meetings

- We e-meet Wednesdays · 11:00 – 11:25am - Time zone: Europe/Paris
- ![Google Meet](https://meet.google.com/uep-fhvf-gto) Video call link: https://meet.google.com/uep-fhvf-gto
- Join by phone: https://tel.meet/uep-fhvf-gto?pin=8160344286211
- Add the Event to your Calendar by [adding the Open Food Facts community calendar to your calendar](https://wiki.openfoodfacts.org/Events)
- [Weekly Agenda](https://docs.google.com/document/d/1BGHfvrgx5eFIGjK8aTNPK2QwAggRp4oohGuYG9lNX8g/edit?tab=t.0): please add the Agenda items as early as you can. Make sure to check the Agenda items in advance of the meeting, so that we have the most informed discussions possible, leading to argumented decisions.
- The meeting will handle Agenda items first, and if time permits, collaborative bug triage.
- We strive to timebox the core of the meeting (decision making) to 30 minutes, with an optional free discussion/live debugging afterwards.
- We take comprehensive notes in the Weekly Agenda of agenda item discussions and of decisions taken.


## Developing

This project uses pnpm. If you have corepack enabled, you should be able to directly use `pnpm` commands. Otherwise, you can install pnpm with `npm install -g pnpm`.

First, install dependencies:

```bash
pnpm install
```

### Environment Variables Setup

Before running the project, set up the environment variables:

```bash
cp .env.example .env
```

Edit the `.env` file as needed to configure your development environment.

Then start the development server:

```bash
pnpm run dev

# or start the server and open the app in a new browser tab
pnpm run dev -- --open
```

## Building

To create a production version of your app:

```bash
pnpm run build
```

You can preview the production build with `pnpm run preview`.

## Contributors
The app was initially created by @VaiTon.
<a href="https://github.com/openfoodfacts/openfoodfacts-explorer/graphs/contributors">
  <img alt="List of contributors to this repository" src="https://contrib.rocks/image?repo=openfoodfacts/openfoodfacts-explorer" />
</a>
