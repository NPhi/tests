/*
    flatToHierachy convert flat contact array into hierarchical contact arr
    for example :
    [  {
        "firstName": "Hung",
        "id": 2
      },
      {
        "firstName": "Chung",
        "superiorId": 2,
        "id": 3
      },
      {
        "firstName": "Du",
        "superiorId": 2,
        "id": 4
      },
    ] 
      output  ----> [
        {
            "firstName": "Hung",
            "id": 2,
            "subs" : [
              {
                "firstName": "Chung",
                "superiorId": 2,
                "id": 3
              },
              {
                "firstName": "Du",
                "superiorId": 2,
                "id": 4
              },
            ]
        },
       ]
*/
export default function flatToHierarchy (flat,{id,parentName,childrenName}) {

    let roots = [] // things without parent

    let all = {}

    flat.forEach(function(item) {
      all[item.id] = Object.assign({},item);
    })

    // connect childrens to its parent, and split roots apart
    Object.keys(all).forEach(function (id) {
        let item = all[id]
        if (item[parentName] === undefined) {
            roots.push(item)
        } else if (item[parentName] in all) {
            let p = all[item[parentName]]
            if (!(childrenName in p)) {
                p[childrenName] = []
            }
            p[childrenName].push(item)
        }
    })

    // done!
    return roots
}