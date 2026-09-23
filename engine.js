/* QuoteScope engine - pure bid-normalization math, shared by app.html and node tests. */
(function(root, factory){
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.QuoteScopeEngine = factory();
})(typeof self !== 'undefined' ? self : this, function(){

  function normKey(desc){
    return desc.trim().replace(/\s+/g, ' ').toLowerCase();
  }

  function display(desc){
    var d = desc.trim().replace(/\s+/g, ' ');
    return d.charAt(0).toUpperCase() + d.slice(1);
  }

  /* bids: [{name, prices:{itemKey:number|null}}], scope: [{key, desc}]
     per-bid summary: quoted total, missing items, worst-case complete cost
     (missing items filled at the highest price any competitor quoted) */
  function summarize(bids, scope){
    return bids.map(function(b){
      var quoted = 0, missing = [], complete = 0;
      scope.forEach(function(it){
        var p = b.prices[it.key];
        var has = typeof p === 'number' && isFinite(p) && p >= 0;
        if (has){ quoted += p; complete += p; }
        else {
          missing.push(it.desc);
          var worst = 0;
          bids.forEach(function(o){
            var q = o.prices[it.key];
            if (typeof q === 'number' && isFinite(q) && q > worst) worst = q;
          });
          complete += worst;
        }
      });
      return {name:b.name, quoted:quoted, missing:missing, complete:complete};
    });
  }

  /* per-item outlier flags: a price >= factor x the lowest competitor price */
  function outliers(bids, scope, factor){
    factor = factor || 1.5;
    var flags = [];
    scope.forEach(function(it){
      var priced = bids.map(function(b){ return {name:b.name, p:b.prices[it.key]}; })
        .filter(function(x){ return typeof x.p === 'number' && isFinite(x.p) && x.p >= 0; });
      if (priced.length < 2) return;
      var min = Math.min.apply(null, priced.map(function(x){ return x.p; }));
      priced.forEach(function(x){
        if (x.p >= min * factor && x.p > min) flags.push({item:it.desc, bid:x.name, price:x.p, lowest:min});
      });
    });
    return flags;
  }

  /* verdict: cheapest bid with nothing missing wins clean; otherwise cheapest worst-case complete */
  function verdict(summaries){
    if (!summaries.length) return null;
    var clean = summaries.filter(function(s){ return s.missing.length === 0; });
    var pool = clean.length ? clean : summaries;
    var best = pool[0];
    pool.forEach(function(s){ if ((clean.length ? s.quoted : s.complete) < (clean.length ? best.quoted : best.complete)) best = s; });
    return {name:best.name, clean:clean.length > 0, amount: clean.length ? best.quoted : best.complete};
  }

  function money(n){
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  return {normKey:normKey, display:display, summarize:summarize, outliers:outliers, verdict:verdict, money:money};
});
