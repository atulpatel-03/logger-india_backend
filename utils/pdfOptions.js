module.exports = {
    formate: 'A4',
    orientation: 'portrait',
    border: '5mm',
    zoom:0.55,
    header: {
        height: '0mm',
    },
    footer: {
        height: '20mm',
        contents: {
            first: 'Cover page',
            2: 'Second page',
            default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', 
            last: 'Last Page'
        }
    }
}