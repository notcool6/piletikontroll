var xmlhttp = new XMLHttpRequest()
var url = "params.json"

var params
xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        params = JSON.parse(xmlhttp.responseText)
        console.log(params.name + ' ' + params.version)
    }
}
xmlhttp.open("GET", url, true)
xmlhttp.send()



var configuration = {
  "ENTU_URI": 'https://piletilevi.entu.ee/'
}

configuration['ENTU_API'] = configuration.ENTU_URI + 'api2/'
configuration['ENTU_API_AUTH'] = configuration.ENTU_API + 'user/auth'
configuration['ENTU_API_USER'] = configuration.ENTU_API + 'user'
configuration['ENTU_API_ENTITY'] = configuration.ENTU_API + 'entity'


var user_data = ''

var submit_field = ''
$('#ticket_field').change(function(event) {
    submit_field = ticket
})
$('#barcode_field').change(function(event) {
    submit_field = barcode
})
$('#submit_btn').click(function(event) {
})


var checkAuth = function checkAuth(successCallback) {

    $.ajax({
        'url': configuration.ENTU_API_USER,
        'headers': {
            'X-Auth-UserId': window.sessionStorage.getItem('ENTU_USER_ID'),
            'X-Auth-Token': window.sessionStorage.getItem('ENTU_SESSION_KEY')
        }
    })
    .done(function userOk( data ) {
        successCallback(data)
    })
    .fail(function userFail( data ) {
        console.log(data)

        var my_auth_string = window.sessionStorage.getItem('my_auth_string')

        if (window.location.hash !== '#' + my_auth_string) {
            var my_random_string = Math.random().toString(35).slice(2,39)
            my_auth_string = Math.random().toString(35).slice(2,39)

            window.sessionStorage.setItem('my_random_string', my_random_string)
            window.sessionStorage.setItem('my_auth_string', my_auth_string)

            var redirect_url = window.location.protocol + '//'
                                + window.location.hostname
                                + window.location.pathname
                                + "#" + my_auth_string

            $.post( configuration.ENTU_API_AUTH, {'state': window.sessionStorage.getItem('my_random_string'), 'redirect_url': redirect_url} )
            .fail(function authFail( data ) {
                console.log(data)
            })
            .done(function authDone( data ) {
                if (window.sessionStorage.getItem('my_random_string') !== data.result.state) {
                    console.log(window.sessionStorage.getItem('my_random_string'))
                    console.log(data.result.state)
                    alert('Security breach!')
                    return
                }
                console.log(data)
                window.sessionStorage.setItem('auth_url', data.result.auth_url)
                window.location.assign(data.result.auth_url)
            })
        } else { // window.location.hash === 'authenticated'
            $.post( window.sessionStorage.getItem('auth_url'), {'state': window.sessionStorage.getItem('my_random_string')} )
            .fail(function authFail( data ) {
                console.log(data)
            })
            .done(function authDone( data ) {
                console.log(data)
                window.sessionStorage.setItem('ENTU_USER_ID', data.result.user.id)
                window.sessionStorage.setItem('ENTU_SESSION_KEY', data.result.user.session_key)

                var redirect_url = window.location.protocol + '//'
                            + window.location.hostname
                            + window.location.pathname
                window.location.assign(redirect_url)
            })
        }
    })
}

checkAuth(function fetchUserDone( data ) {
    $('#user_email').text(data.result.name)
    $.ajax({
        'url': configuration.ENTU_API_ENTITY + '-' + data.result.id,
        'headers': {
            'X-Auth-UserId': window.sessionStorage.getItem('ENTU_USER_ID'),
            'X-Auth-Token': window.sessionStorage.getItem('ENTU_SESSION_KEY')
        }
    })
    .done(function userOk( data ) {
        user_data = data.result
        console.log(user_data)
    })
    .fail(function userFail( data ) {
        console.log(data)
})
