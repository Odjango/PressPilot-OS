# WP Block Serialization Violations Report

## templates/404.html
- Line 3: [group] Missing wrapper. Expected `<main`.
  - Found: `<!-- wp:heading {"textAlign":"center","level":1} -`

## templates/archive.html
- Line 3: [group] Missing wrapper. Expected `<main`.
  - Found: `<!-- wp:group {"layout":{"type":"constrained","jus`
- Line 4: [group] Missing wrapper. Expected `<div or <main or <header or <footer or <section or <article or <aside`.
  - Found: `<!-- wp:archive-title /-->\n        <!-- wp:archive`
- Line 10: [group] Missing wrapper. Expected `<div or <main or <header or <footer or <section or <article or <aside`.
  - Found: `<!-- wp:post-title {"isLink":true} /-->\n          `

## templates/index.html
- Line 3: [group] Missing wrapper. Expected `<main`.
  - Found: `<!-- wp:heading {"level":2} -->\nLatest posts\n<!-- `

## templates/page.html
- Line 3: [group] Missing wrapper. Expected `<main`.
  - Found: `<!-- wp:group {"layout":{"type":"constrained","jus`
- Line 4: [group] Missing wrapper. Expected `<div or <main or <header or <footer or <section or <article or <aside`.
  - Found: `<!-- wp:post-title {"level":1} /-->\n        <!-- w`

## templates/search.html
- Line 3: [group] Missing wrapper. Expected `<main`.
  - Found: `<!-- wp:group {"layout":{"type":"constrained","jus`
- Line 4: [group] Missing wrapper. Expected `<div or <main or <header or <footer or <section or <article or <aside`.
  - Found: `<!-- wp:search {"label":"Search","showLabel":false`
- Line 9: [group] Missing wrapper. Expected `<div or <main or <header or <footer or <section or <article or <aside`.
  - Found: `<!-- wp:post-title {"isLink":true} /-->\n          `

## templates/single.html
- Line 3: [group] Missing wrapper. Expected `<main`.
  - Found: `<!-- wp:spacer {"height":"var:preset|spacing|40"} `
- Line 19: [group] Missing wrapper. Expected `<div or <main or <header or <footer or <section or <article or <aside`.
  - Found: `<!-- wp:comments-title {"level":3} /-->\n<!-- wp:co`
- Line 22: [columns] Missing wrapper. Expected `<div class="wp-block-columns`.
  - Found: `<!-- wp:column {"width":"48px"} -->\n<!-- wp:avatar`
- Line 23: [column] Missing wrapper. Expected `<div class="wp-block-column`.
  - Found: `<!-- wp:avatar {"size":48,"style":{"border":{"radi`
- Line 26: [column] Missing wrapper. Expected `<div class="wp-block-column`.
  - Found: `<!-- wp:comment-author-name /-->\n<!-- wp:comment-d`

## patterns/home-services.html
- Line 2: [group] Missing wrapper. Expected `<div or <main or <header or <footer or <section or <article or <aside`.
  - Found: `<!-- wp:heading {"level":2,"style":{"typography":{`
- Line 7: [columns] Missing wrapper. Expected `<div class="wp-block-columns`.
  - Found: `<!-- wp:column -->\n			<!-- wp:heading {"level":3} `
- Line 8: [column] Missing wrapper. Expected `<div class="wp-block-column`.
  - Found: `<!-- wp:heading {"level":3} -->\n			<h3>Service One`
- Line 17: [column] Missing wrapper. Expected `<div class="wp-block-column`.
  - Found: `<!-- wp:heading {"level":3} -->\n			<h3>Service Two`
- Line 26: [column] Missing wrapper. Expected `<div class="wp-block-column`.
  - Found: `<!-- wp:heading {"level":3} -->\n			<h3>Service Thr`

## patterns/seed-details.html
- Line 1: [group] Missing wrapper. Expected `<div or <main or <header or <footer or <section or <article or <aside`.
  - Found: `<!-- wp:heading {"level":2} -->\n    <h2>Details</h`

## patterns/seed-features.html
- Line 1: [group] Missing wrapper. Expected `<div or <main or <header or <footer or <section or <article or <aside`.
  - Found: `<!-- wp:heading {"level":2} -->\n    <h2>What we pr`
- Line 6: [columns] Missing wrapper. Expected `<div class="wp-block-columns`.
  - Found: `<!-- wp:column -->\n            <!-- wp:heading {"l`
- Line 7: [column] Missing wrapper. Expected `<div class="wp-block-column`.
  - Found: `<!-- wp:heading {"level":3} -->\n            <h3>Se`
- Line 16: [column] Missing wrapper. Expected `<div class="wp-block-column`.
  - Found: `<!-- wp:heading {"level":3} -->\n            <h3>Se`
- Line 25: [column] Missing wrapper. Expected `<div class="wp-block-column`.
  - Found: `<!-- wp:heading {"level":3} -->\n            <h3>Se`

