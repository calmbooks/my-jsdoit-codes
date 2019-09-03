do ( win = window, doc = document ) =>

    preview = doc.getElementById "preview"

    input_column = doc.getElementById "input_column"

    cvs = doc.getElementById "c"
    ctx = cvs.getContext "2d"

    class Main

        constructor : () ->

            @init()

        init : () =>

            @images = new Array()

            @colmun_n = null

            @set_events()

        set_events : () =>

            preview.addEventListener "dragover", ( event ) =>

                event.preventDefault()

            ,false

            preview.addEventListener "drop", ( event ) =>

                event.preventDefault()

                files = event.dataTransfer.files

                @set_drop_files files

            ,false

            input_column.addEventListener "change", ( event, event1, event2 ) =>

                @colmun_n = event.target.valueAsNumber

                @set_input_column_value()

                @set_preview()

        set_drop_files : ( files ) =>

            load_count = 0

            for file in files

                reader = new FileReader()

                reader.addEventListener "load", ( event ) =>

                    image = new Image()

                    image.src = event.target.result

                    @images.push image

                    load_count += 1

                    @set_preview( 3 ) if load_count >= files.length

                , false

                reader.readAsDataURL file

        set_preview : () =>

            @images_n = @images.length

            return if @images_n <= 0

            if @colmun_n is null

                @colmun_n = Math.ceil Math.sqrt( @images_n )

            @set_input_column_value()

            image_max_w = 0
            image_max_h = 0

            for image in @images

                image_max_w = Math.max image.width, image_max_w
                image_max_h = Math.max image.height, image_max_h

            @image_max_w = image_max_w
            @image_max_h = image_max_h

            @output_w = @image_max_w * @colmun_n
            @output_h = @image_max_h * Math.ceil( @images_n / @colmun_n )

            cvs.width  = @output_w
            cvs.height = @output_h

            cvs.style.display = "block"

            @render_image()

        render_image : () =>
        
            for i in [0...@images.length]

                x = ( i % @colmun_n ) * @image_max_w
                y = ( i / @colmun_n | 0 ) * @image_max_h

                image = @images[i]

                ctx.drawImage image, x, y

            @set_download()

        set_download : () =>

            button = doc.getElementById "btn_download"

            button.setAttribute "class", ""
            button.setAttribute "href", cvs.toDataURL()

        set_input_column_value : () =>

            input_column.setAttribute "max", @images_n
            input_column.setAttribute "value", @colmun_n

    win.addEventListener "load", =>

        new Main()

    , false
