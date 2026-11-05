import { toSitePath } from '../../../data/deployment.js';
import { imageMarkup } from '../components/media.js';
import { productTagMarkup, productActionsMarkup } from '../components/product.js';
import { guideListMarkup, deliveryFactsMarkup } from '../components/blocks.js';

export function homePageMarkup(product) {
  const productHref = toSitePath(product.slug);
  return `<section class="home-hero" aria-labelledby="home-title">
    <div class="shell home-hero__grid">
      <div class="home-hero__intro">
        <h1 id="home-title">Car-care accessories, starting with the drying towel.</h1>
        <p class="lede">ZENO DETAIL is a new car-care brand. Our first product is an 850 GSM microfiber towel for drying your car after a wash.</p>
      </div>
      <div class="home-hero__visual">${imageMarkup('home-hero', { eager: true, sizes: '(min-width: 64rem) 60vw, 100vw', className: 'home-hero__media' })}</div>
      ${productTagMarkup(product, { headingLevel: 2, className: 'home-hero__tag', actions: productActionsMarkup(product) })}
    </div>
  </section>

  <section class="closeup" aria-labelledby="closeup-title">
    <div class="shell closeup__grid">
      ${imageMarkup('product-edge-label', { className: 'closeup__large', sizes: '(min-width: 64rem) 50vw, 100vw' })}
      <div class="closeup__text">
        <h2 id="closeup-title">Blue microfiber, a black edge and the ZENO DETAIL mark.</h2>
        <p>The ZENO Drying Towel is made for one job: drying your car after you wash it. It is specified at 850 GSM and finished in blue with black edging.</p>
        <p>GSM is the weight of the fabric per square metre. It describes the material, not how much water a towel holds, so we list it as a specification rather than a performance claim.</p>
        <a class="text-link" href="${productHref}#specifications">See the specifications</a>
      </div>
      ${imageMarkup('product-folded', { className: 'closeup__small', sizes: '(min-width: 64rem) 26vw, 60vw' })}
    </div>
  </section>

  <section class="routine" aria-labelledby="routine-title">
    <div class="routine__media">${imageMarkup('drying-in-use', { sizes: '(min-width: 64rem) 55vw, 100vw', caption: false })}</div>
    <div class="routine__body">
      <h2 id="routine-title">Drying a car, in four steps</h2>
      <ol class="steps">
        <li><strong>Work in the shade.</strong> Dry a cool, fully rinsed car so water does not evaporate into marks.</li>
        <li><strong>Check the towel.</strong> Make sure it is clean and free of grit before it touches the paint.</li>
        <li><strong>Start at the roof.</strong> Work downwards with light contact, turning the towel to a dry side as you go.</li>
        <li><strong>Finish the edges.</strong> Mirrors, handles and panel gaps hold water, so dry them last.</li>
      </ol>
      <a class="text-link text-link--on-ink" href="${toSitePath('/journal/how-to-dry-your-car/')}">Read the full drying guide</a>
    </div>
  </section>

  <section class="section delivery-band" aria-labelledby="delivery-title">
    <div class="shell split">
      <div class="split__head">
        <h2 id="delivery-title">Delivery and ordering</h2>
        <a class="text-link" href="${toSitePath('/shipping-delivery/')}">Delivery information</a>
      </div>
      ${deliveryFactsMarkup()}
    </div>
  </section>

  <section class="section guides-band" aria-labelledby="guides-title">
    <div class="shell split">
      <div class="split__head">
        <h2 id="guides-title">Care guides</h2>
        <p>Practical notes on washing, drying and looking after the details.</p>
        <a class="text-link" href="${toSitePath('/journal/')}">All care guides</a>
      </div>
      ${guideListMarkup()}
    </div>
  </section>`;
}
