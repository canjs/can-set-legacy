
@function can-set-legacy.Algebra.prototype.union union
@parent can-set-legacy.Algebra.prototype

@signature `algebra.union(a, b)`

Returns a set that represents the union of _A_ and _B_ (_A_ ∪ _B_).

```js
algebra.union(
  {start: 0, end: 99},
  {start: 100, end: 199},
) //-> {start: 0, end: 199}
```

  @param  {can-set-legacy/Set} a A set.
  @param  {can-set-legacy/Set} b A set.
  @return {can-set-legacy/Set|Boolean} If an object is returned, it is the union of _A_ and _B_ (_A_ ∪ _B_).

  If `false` is returned, it means a union can't be created.
