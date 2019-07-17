const fileInput = document.querySelector('#file');
const count = document.querySelector('#count');
const search = document.querySelector('#search');
const matchList = document.querySelector('#character');
const result = document.querySelector('#result');
let countValue = count.value;

fileInput.addEventListener('input', (e) => {
    const reader = new FileReader();
    //read uploaded .csv file 
    reader.onload = () => {
        const strArr = reader.result.split('\n');
        const data = []
        strArr.forEach((i) => {
            const dataObj = new Object();
            dataObj.value = i.split(',')[0]
            dataObj.count = i.split(',')[1]
            data.push(dataObj)
        });

        //create array for prefix tree
        const valueArr = strArr.map((i) => i.split(',')[0]);

        const newTree = new PrefixTree();
        valueArr.map(i => newTree.addWord(i));

        search.addEventListener('input', async (e) => {
            const value = e.target.value;
            let matches = newTree.predictWord(value);

            //To predict long data loading, have to defind count  
            //of first results matches 
            if (matches.length > countValue) {
                matches.length = countValue;
            }
            outputMatches(matches);
        })

        //Put results into <p> according to choosen word
        search.addEventListener('change', (e) => {
            if (e.target.value.length === 0) {
                result.innerHTML = '';
            } else {
                let output = data.find(el => el.value === e.target.value);
                result.innerHTML = `Word: ${e.target.value}; count: ${output.count}`
            }
        })
    }
    reader.readAsText(fileInput.files[0]);
}
)

//changing the number of first matches
count.addEventListener('change', e => countValue = +e.target.value)

const outputMatches = matches => {
    if (matches.length === 0) {
        console.log('here')
    }
    const html = matches.map(
        match => `
            <option value="${match}">${match}</li>
            `).join('');
    matchList.innerHTML = html;
}



// Class PrefixTree
class PrefixTreeNode {
    constructor(value) {
        this.children = {};
        this.endWord = null;
        this.value = value;
    }
}

class PrefixTree extends PrefixTreeNode {
    constructor() {
        super(null);
    }
    addWord(string) {
        const addWordHelper = (node, str) => {
            if (!node.children[str[0]]) {
                node.children[str[0]] = new PrefixTreeNode(str[0]);
                if (str.length === 1) {
                    node.children[str[0]].endWord = 1;
                }
            }
            if (str.length > 1) {
                addWordHelper(node.children[str[0]], str.slice(1));
            }
        };
        addWordHelper(this, string);
    }

    predictWord(string) {
        const getRemainingTree = function (string, tree) {
            let node = tree;
            while (string) {
                node = node.children[string[0]];
                string = string.substr(1);
            }
            return node;
        };

        let allWords = [];

        const allWordsHelper = function (stringSoFar, tree) {
            for (let k in tree.children) {
                const child = tree.children[k];
                let newString = stringSoFar + child.value;
                if (child.endWord) {
                    allWords.push(newString);
                }
                allWordsHelper(newString, child);
            }
        }

        const remainingTree = getRemainingTree(string, this);

        if (remainingTree === undefined) {
            allWords = [];
        } else {
            allWordsHelper(string, remainingTree);
            return allWords;
        }
        return allWords;
    }
};
