# Path Tag Bumper

## What is it?
This enables you to create tags bases on a prefix so you can have multiple docker image build per repository (ex. if your pipeline is trigger on a branch with a specific path).

## Inputs and Outputs
Prefix is the prefix you want to append to your lookup version in github versions(ex. user ...  will be stores in tags as user-1.0.0 when new version, but the out put will be 1.0.0 when you update codebase in path where the prefix is it will then generate the next version user-1.0.1 and so on).

```yaml
inputs:
  github-token:
    description: "Token"
    required: true
  prefix-tag:
    description: "Service name as prefix for tag"
    required: true
outputs:
  new-tag:
    description: "Output from the action"
```

## Example usage
```yaml
on:
  push:    
    paths:
      - "<path to the fiels you want to trigger on>"

jobs:
  generate-version:    
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Path Tag Bumper
        id: tag-bumper
        uses: gls-denmark/path-tag-bumper@1.0.8
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          prefix-tag: "<your prefix to diffrenciate your tags by>"
          github-token: ${{ secrets.GITHUB_TOKEN }}
      - name: Print New Tag
        run: echo "The value is ${{ steps.tag-bumper.outputs.new-tag }}"
    outputs:
      new_version: ${{steps.tag-bumper.outputs.new-tag}}
```
