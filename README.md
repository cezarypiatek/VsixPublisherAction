# VsixPublisher Github Action
GithubAction for publishing extensions to Visual Studio Marketplace


Example usage:

```yml
- name: Publish extension to Marketplace
    uses: cezarypiatek/VsixPublisherAction@0.1
    with:
        extension-file: src\MappingGenerator.Vsix\bin\Release\MappingGenerator.vsix
        publish-manifest-file: src\MappingGenerator.Vsix\publishManifest.json
        personal-access-code: ${{ secrets.VS_PUBLISHER_ACCESS_TOKEN }}
```

Example `publishManifest.json`

```json
{
    "$schema": "http://json.schemastore.org/vsix-publish",
    "categories": [
        "coding",
        "scaffolding"
    ],
    "identity": {
        "internalName": "mappinggenerator"
    },
    "overview": "overview.md",
    "priceCategory": "free",
    "publisher": "54748ff9-45fc-43c2-8ec5-cf7912bc3b84",
    "private": false,
    "qna": true,
    "repo": "https://github.com/cezarypiatek/MappingGenerator"
}
```

[How to generate Personal Access Token](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token)
