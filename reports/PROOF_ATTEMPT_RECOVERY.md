# Proof of Attempt Recovery

## Missing List Wrapper (templates/front-page.html)
```html
<!-- wp:list -->
<!-- wp:list-item -->
```
*Violation: `wp:list` is followed immediately by `wp:list-item`. Expected `<ul>`.*

## Missing Paragraph Wrapper (parts/footer.html)
```html
<!-- wp:paragraph -->
<a href="/about">About</a>
```
*Violation: `wp:paragraph` is followed immediately by `<a>`. Expected `<p>`.*
