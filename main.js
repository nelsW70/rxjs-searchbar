const output = document.getElementById('response-list');

function showResults(resp) {
  var items = resp['message']['items'];
  output.innerHTML = '';
  animationDelay = 0;
  if (items.length == 0) {
    output.innerHTML = 'Could not find any :(';
  } else {
    items.forEach((item) => {
      resultItem = `
  <div class="list-group-item animated fadeInUp" style="animation-delay: ${animationDelay}s;">
    <div class="d-flex w-100 justify-content-between">
      <h5 class="mb-1">${
        (item['title'] && item['title'][0]) || '&lt;Title not available&gt;'
      }</h5>
    </div>
    <p class="mb-1">${
      (item['container-title'] && item['container-title'][0]) || ''
    }</p>
    <small class="text-muted"><a href="${item['URL']}" target="_blank">${
        item['URL']
      }</a></small>
    <div> 
      <p class="badge badge-primary badge-pill">${item['publisher'] || ''}</p>
      <p class="badge badge-primary badge-pill">${item['type'] || ''}</p> 
    </div>
  </div>
  `;
      output.insertAdjacentHTML('beforeend', resultItem);
      animationDelay += 0.1;
    });
  }
}

let searchInput = document.getElementById('search-input');
Rx.Observable.fromEvent(searchInput, 'input')
  .pluck('target', 'value')
  .filter((searchTerm) => searchTerm.length > 2)
  .debounceTime(500)
  .distinctUntilChanged()
  .switchMap((searchKey) =>
    Rx.Observable.ajax(
      `https://api.crossref.org/works?rows=50&query.author=${searchKey}`
    ).map((resp) => ({
      status: resp['status'] == 200,
      details: resp['status'] == 200 ? resp['response'] : [],
      result_hash: Date.now(),
    }))
  )
  .filter((resp) => resp.status !== false)
  .distinctUntilChanged((a, b) => a.result_hash === b.result_hash)
  .subscribe((resp) => showResults(resp.details));
