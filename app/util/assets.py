from flask import Flask
from flask_assets import Bundle, Environment
from .. import app

bundles = {
    'js': Bundle(

        'js/script.js',
        output='gen/script.js'
        )


}

assets = Environment(app)

assets.register(bundles)
