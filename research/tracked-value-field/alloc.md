| kind of value | operation | Node 24.20, before | Node 24.20, after | Node 26.10, before | Node 26.10, after |
| --- | --- | ---: | ---: | ---: | ---: |
| small integer | create | 184.1 | 184.1 | 240.2 | 240.2 |
| small integer | read | 0.0 | 0.0 | 0.1 | 0.1 |
| small integer | write | 0.0 | 0.0 | 0.1 | 0.1 |
| double | create | 200.1 | 200.1 | 256.2 | 256.2 |
| double | read | 0.0 | 0.0 | 0.2 | 0.2 |
| double | write | 16.0 | 16.0 | 16.0 | 16.0 |
| string | create | 184.1 | 184.1 | 240.1 | 240.1 |
| string | read | 0.0 | 0.0 | 0.1 | 0.1 |
| string | write | 0.0 | 0.0 | 0.1 | 0.1 |
| boolean | create | 184.1 | 184.1 | 240.2 | 240.2 |
| boolean | read | 0.0 | 0.0 | 0.2 | 0.2 |
| boolean | write | 0.0 | 0.0 | 0.1 | 0.1 |
| undefined and null | create | 184.1 | 184.1 | 240.2 | 240.2 |
| undefined and null | read | 0.0 | 0.0 | 0.2 | 0.2 |
| undefined and null | write | 0.0 | 0.0 | 0.1 | 0.1 |
| object | create | 240.0 | 240.0 | 296.3 | 296.3 |
| object | read | 0.0 | 0.0 | 0.1 | 0.1 |
| object | write | 0.0 | 0.0 | 0.1 | 0.1 |
| array | create | 184.1 | 184.1 | 240.1 | 240.1 |
| array | read | 0.0 | 0.0 | 0.2 | 0.1 |
| array | write | 0.0 | 0.0 | 0.1 | 0.1 |
| function | create | 184.1 | 184.1 | 240.2 | 240.2 |
| function | read | 0.0 | 0.0 | 0.2 | 0.1 |
| function | write | 0.0 | 0.0 | 0.1 | 0.1 |
| symbol | create | 184.1 | 184.1 | 240.2 | 240.2 |
| symbol | read | 0.0 | 0.0 | 0.2 | 0.2 |
| symbol | write | 0.0 | 0.0 | 0.1 | 0.1 |
| bigint | create | 184.1 | 184.1 | 240.2 | 240.2 |
| bigint | read | 0.0 | 0.0 | 0.2 | 0.2 |
| bigint | write | 0.0 | 0.0 | 0.1 | 0.1 |
| all kinds mixed | create | 195.2 | 195.2 | 245.9 | 245.9 |
| all kinds mixed | read | 0.0 | 0.0 | 0.1 | 0.2 |
| all kinds mixed | write | 0.0 | 0.0 | 0.1 | 0.1 |

- Bytes that V8 allocates for one operation on one tracked value.
- "Before" is `50eef0f8c1`. "After" is `54ee916923`, with the store of `0`.
- Node 24.20 reports the growth of the used heap with no GC. Node 26.10 reports `total_allocated_bytes`.
- A value below 0.2 is the cost of the measurement, not of the operation.
