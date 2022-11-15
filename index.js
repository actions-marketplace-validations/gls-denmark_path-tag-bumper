const core = require('@actions/core');
const github = require('@actions/github');
const semver = require('semver');
var bumpVersion = require('semver-increment');

async function run(){
    const MAJOR = 0;// don't bump MAJOR
    const MINOR = 0;// don't bump MINOR
    const PATCH = 1;// bump PATCH
    const mask = [MAJOR, MINOR, PATCH];
    const prefix = core.getInput("prefix-tag");
    const defaultVersion = "1.0.0";
    var token =  process.env.GITHUB_TOKEN;

    var client = github.getOctokit(token);
    let morePages = true;
    let tagsBeforeFilter = []; 
    let i = 1;
    do{
        const {data} =  await client.rest.repos.listTags({
            ...github.context.repo,
            per_page: 50,
            page: i
        })
        i++;
        if(data && data.length === 0) morePages = false;
        tagsBeforeFilter = tagsBeforeFilter.concat(data);
    }while(morePages)


    console.log(JSON.stringify(tagsBeforeFilter));
    const tags = tagsBeforeFilter.filter(x=> {
        console.log("testing: " + prefix + " name: "+ x.name + " indexOf: " + x.name.includes(prefix));
        if(x.name.includes(prefix)){
            return x;
        }

    })
    console.log(tags.length);
    if(tags.length === 0){
        const tag = `${prefix}-${defaultVersion}`;
        await CreateTag(github.context.repo,tag, github.context.sha)        
        core.setOutput("new-tag",defaultVersion);
    }
    else{
        let latestTag = defaultVersion;        
        tags.map(x=>{          
            const listVerArr = x.name.split('-');
            const listVer = listVerArr[listVerArr.length - 1];
            if(semver.gt(listVer,latestTag)){
                latestTag = semver.clean(listVer);
            }
        })        
        const bumpedVersion = bumpVersion(mask,latestTag);

        const tag = `${prefix}-${bumpedVersion}`;
        await CreateTag(github.context.repo,tag, github.context.sha)
        
        core.setOutput("new-tag",bumpedVersion);
    }
}
async function CreateTag(repo, version, sha){
    var token =  process.env.GITHUB_TOKEN;
    var client = github.getOctokit(token);
    const tag_resp = await client.rest.git.createTag({
        ...repo,
        tag: version,
        message:version,
        object: sha,
        type: 'commit'
    })
    const ref_rsp = await client.rest.git.createRef({
        ...repo,
        ref: `refs/tags/${version}`,
        sha: tag_resp.data.sha
    })
}
try {
    run()
} catch (error) {
    if (error instanceof Error) {
        core.setFailed(`CREATE_TAG_ERROR:${error.message}`)
    } else {
        core.setFailed(`CREATE_TAG_ERR:${error}`)
    }
}
