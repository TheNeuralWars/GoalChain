# Program keypair (sensible)

El **Program ID de producción/devnet** es:

`FbDhM4itBS2Cco7c7PbNvC98Fx7Y5HxqXS1JuXdNcBwg`

Para `anchor build` / `anchor test`, copia el archivo del equipo aquí:

```
target/deploy/goalchain_program-keypair.json
```

Sin ese archivo, Anchor generará un ID nuevo y fallará el build con "Program ID mismatch".

**Alternativa solo para pruebas locales aisladas** (cambia IDs en el repo):

```bash
anchor keys sync
anchor build
anchor test --validator legacy
```

No uses `keys sync` en ramas que despliegan a devnet/mainnet con el ID oficial.
