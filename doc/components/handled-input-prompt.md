# `HandledInputPrompt`

An `InputPrompt` that implements `ink.useInput` for you. It accepts all of `InputPrompt`'s properties. 

```js
ink.render(e(HandledInputprompt, properties));
```

## Properties

<details>

## useDefaultKeys
Type : `boolean`

If `HandledInputPrompt` should use the default keybindings defined at `InputPrompt.DefaultKeyBindings`. Default: `true`.

## additionalKeys
Type : `object`

Supply custom keybindings. If `useDefaultKeys` is false, this will be the only keybindings, if true, it will only be combined with existing keys. To overwrite keybindings, set `useDefaultKeys` false, and supply a modified copy of `InputPrompt.DefaultKeyBindings` here.


</details>