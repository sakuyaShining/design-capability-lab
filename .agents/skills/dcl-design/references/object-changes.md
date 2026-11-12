# Cross-object operations

Read when an operation changes an object's identity, ownership, membership, relationships, or creates a derived object. Identify the actual user intent first. Move, merge, copy, export and create-and-link have different outcomes.

| Decision | Record and expose when relevant |
| --- | --- |
| Source and destination | Identify the objects and the scope that owns them. Explain what stays, moves, becomes inaccessible or is replaced. |
| Relationship and metadata | State which links, history or fields are retained. When two inputs disagree, give the user a way to resolve meaningful conflicts. |
| Commit and recovery | State what counts as success. If results can be partial or uncertain, give a way to verify what happened and resume safely. Use a stable operation identity or another appropriate safeguard when replaying the same intent could duplicate effects. An intentional second operation can have different semantics. |
| Next action | Show the outcome beside the originating context. When a specific result exists and can be opened, link to that result. Describe permission or resolution limits at the point of use. |

Use a compact inline action when one outcome is clear and local. For high-impact or ambiguous operations, use a preview or comparison that shows the affected objects, destination and unresolved choices before committing.

Test facts that distinguish a true result from a success message. For an operation that should create and link one object, check the target count and that the returned link resolves to the expected target. For conflict, cancellation or partial failure, check the facts that should stay stable and the recovery action the user can actually take. Capture them from the running UI or its persisted test state. Use the [behavior validator](behavior.md) when the operation fits the contract format. The [fictional photo shortlist contract](linked-record-operation.json) illustrates these checks.
